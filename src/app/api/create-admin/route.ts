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

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.some((u: any) => u.email === email);

    if (userExists) {
      // Si mode check_only, juste retourner l'info
      if (checkOnly) {
        const user = existingUser.users.find((u: any) => u.email === email);
        return NextResponse.json({
          success: true,
          exists: true,
          message: "Utilisateur existe dans Supabase Auth",
          userId: user?.id || "unknown",
        });
      }
      // L'utilisateur existe déjà, on le met à jour
      const user = existingUser.users.find((u: any) => u.email === email);
      
      if (!user) {
        return NextResponse.json(
          { error: "Utilisateur trouvé mais impossible de récupérer les détails" },
          { status: 500 }
        );
      }
      
      // Mettre à jour le mot de passe si fourni
      if (password) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: password,
        });
      }

      // Ajouter dans admin_users si pas déjà présent
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
        userId: user?.id || "unknown",
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

