import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API Route pour créer un utilisateur admin
 * Utilise la clé service_role pour bypasser RLS
 * 
 * IMPORTANT: Cette route doit être protégée en production
 * Pour l'instant, elle est accessible pour le setup initial
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Mode "check_only" : juste vérifier si l'utilisateur existe
    const checkOnly = password === "check_only";
    
    if (!checkOnly && !password) {
      return NextResponse.json(
        { error: "Mot de passe requis" },
        { status: 400 }
      );
    }

    // Utiliser la clé service_role pour créer l'utilisateur
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { 
          error: "Configuration Supabase manquante",
          details: "SUPABASE_SERVICE_ROLE_KEY doit être configuré dans .env.local"
        },
        { status: 500 }
      );
    }

    // Créer un client avec la clé service_role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fonction helper pour trouver un utilisateur par email
    const findUserByEmail = async (emailToFind: string) => {
      try {
        // Essayer de lister tous les utilisateurs et chercher par email
        // Note: listUsers() peut ne pas retourner tous les utilisateurs (pagination, filtres, etc.)
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page: page,
            perPage: 1000, // Maximum par page
          });
          
          if (listError) {
            console.error("Erreur listUsers:", listError);
            break;
          }
          
          const foundUser = allUsers?.users?.find((u: any) => 
            u.email?.toLowerCase() === emailToFind.toLowerCase()
          );
          
          if (foundUser) {
            return foundUser;
          }
          
          // Vérifier s'il y a plus de pages
          hasMore = allUsers?.users && allUsers.users.length === 1000;
          page++;
          
          // Limite de sécurité pour éviter les boucles infinies
          if (page > 10) {
            break;
          }
        }
        
        return null;
      } catch (err) {
        console.error("Erreur lors de la recherche d'utilisateur:", err);
        return null;
      }
    };

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      // Si mode check_only, juste retourner l'info
      if (checkOnly) {
        return NextResponse.json({
          success: true,
          exists: true,
          message: "Utilisateur existe dans Supabase Auth",
          userId: existingUser.id || "unknown",
        });
      }
      
      // L'utilisateur existe déjà, on le met à jour
      // Mettre à jour le mot de passe si fourni
      if (password) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: password,
          email_confirm: true, // Confirmer l'email
        });
        
        if (updateError) {
          console.error("Erreur mise à jour mot de passe:", updateError);
          return NextResponse.json(
            { 
              error: "Erreur lors de la mise à jour du mot de passe",
              details: updateError.message 
            },
            { status: 400 }
          );
        }
      }

      // Ajouter dans admin_users si pas déjà présent
      const { data: adminExists } = await supabaseAdmin
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single();

      if (!adminExists) {
        const { error: insertAdminError } = await supabaseAdmin.from("admin_users").insert({
          email: email,
          name: name || "Admin",
          is_active: true,
        });
        
        if (insertAdminError && !insertAdminError.message.includes("duplicate")) {
          console.error("Erreur ajout admin:", insertAdminError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Utilisateur existant mis à jour et ajouté comme admin",
        userId: existingUser.id || "unknown",
      });
    }

    // Si mode check_only et utilisateur n'existe pas
    if (checkOnly) {
      return NextResponse.json({
        success: false,
        exists: false,
        message: "Utilisateur n'existe pas dans Supabase Auth",
      });
    }

    // Créer le nouvel utilisateur
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmer l'email
    });

    if (createError) {
      console.error("Erreur création utilisateur:", createError);
      
      // Si l'erreur indique que l'utilisateur existe déjà (duplicate key)
      if (
        createError.message?.includes("duplicate") ||
        createError.message?.includes("users_email_partial_key") ||
        createError.message?.includes("already exists")
      ) {
        // L'utilisateur existe mais n'a pas été trouvé par listUsers (peut-être un utilisateur invité)
        // Essayer de le récupérer et le mettre à jour
        console.log("Utilisateur existe déjà, tentative de récupération...");
        
        // Réessayer de trouver l'utilisateur (peut-être qu'il apparaît maintenant)
        const foundUser = await findUserByEmail(email);
        
        if (foundUser) {
          // Mettre à jour le mot de passe
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(foundUser.id, {
            password: password,
            email_confirm: true,
          });
          
          if (updateError) {
            return NextResponse.json(
              { 
                error: "Utilisateur existe déjà mais erreur lors de la mise à jour",
                details: updateError.message 
              },
              { status: 400 }
            );
          }
          
          // Ajouter dans admin_users
          const { data: adminExists } = await supabaseAdmin
            .from("admin_users")
            .select("*")
            .eq("email", email)
            .single();

          if (!adminExists) {
            await supabaseAdmin.from("admin_users").insert({
              email: email,
              name: name || "Admin",
              is_active: true,
            });
          }
          
          return NextResponse.json({
            success: true,
            message: "Utilisateur existant mis à jour et ajouté comme admin",
            userId: foundUser.id,
          });
        }
        
        // Si on ne peut toujours pas trouver l'utilisateur, retourner une erreur explicite
        return NextResponse.json(
          { 
            error: "L'utilisateur existe déjà dans Supabase Auth mais n'a pas pu être récupéré",
            details: "Essayez d'utiliser la page /admin/set-password pour définir le mot de passe",
            suggestion: "L'utilisateur peut être un utilisateur invité ou avoir un statut spécial"
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Erreur lors de la création de l'utilisateur",
          details: createError.message 
        },
        { status: 400 }
      );
    }

    // Ajouter dans la table admin_users
    const { error: adminError } = await supabaseAdmin
      .from("admin_users")
      .insert({
        email: email,
        name: name || "Admin",
        is_active: true,
      });

    if (adminError) {
      console.error("Erreur ajout admin:", adminError);
      // Ne pas échouer si l'admin existe déjà
      if (!adminError.message.includes("duplicate")) {
        return NextResponse.json(
          { 
            error: "Utilisateur créé mais erreur lors de l'ajout comme admin",
            details: adminError.message 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin créé avec succès",
      userId: newUser.user?.id,
      email: email,
    });
  } catch (error: any) {
    console.error("Erreur API create-admin:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

