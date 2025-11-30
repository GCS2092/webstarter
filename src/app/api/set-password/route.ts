import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API Route pour définir/mettre à jour le mot de passe d'un utilisateur existant
 * Utilise la clé service_role pour accéder à l'API admin de Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    // Log pour débogage
    console.log("API set-password appelée");

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Erreur parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Format JSON invalide" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Utiliser la clé service_role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Vérification variables d'environnement:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseServiceKey?.length || 0,
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variables d'environnement manquantes:", {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
        supabaseUrlLength: supabaseUrl?.length || 0,
        serviceKeyLength: supabaseServiceKey?.length || 0,
      });
      return NextResponse.json(
        { 
          error: "Configuration Supabase manquante",
          details: "SUPABASE_SERVICE_ROLE_KEY doit être configuré dans les variables d'environnement Vercel",
          debug: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "non défini",
          }
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

    // Chercher l'utilisateur par email
    console.log("Recherche de l'utilisateur:", email);
    
    let usersData;
    let listError;
    
    try {
      const result = await supabaseAdmin.auth.admin.listUsers();
      usersData = result.data;
      listError = result.error;
    } catch (err: any) {
      console.error("Exception lors de listUsers:", err);
      return NextResponse.json(
        { 
          error: "Erreur lors de la recherche de l'utilisateur",
          details: err.message || "Erreur inconnue lors de l'appel à Supabase"
        },
        { status: 500 }
      );
    }

    if (listError) {
      console.error("Erreur listUsers:", listError);
      return NextResponse.json(
        { 
          error: "Erreur lors de la recherche de l'utilisateur",
          details: listError.message,
          code: listError.status || listError.code
        },
        { status: 500 }
      );
    }

    console.log("Nombre d'utilisateurs trouvés:", usersData?.users?.length || 0);

    const user = usersData?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log("Utilisateur non trouvé pour:", email);
      return NextResponse.json(
        { 
          error: "Utilisateur non trouvé",
          details: `Aucun utilisateur trouvé avec l'email: ${email}`
        },
        { status: 404 }
      );
    }

    console.log("Utilisateur trouvé:", { id: user.id, email: user.email });

    // Mettre à jour le mot de passe de l'utilisateur
    console.log("Mise à jour du mot de passe pour l'utilisateur:", user.id);
    
    let updateData;
    let updateError;
    
    try {
      const result = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          password: password,
        }
      );
      updateData = result.data;
      updateError = result.error;
    } catch (err: any) {
      console.error("Exception lors de updateUserById:", err);
      return NextResponse.json(
        { 
          error: "Erreur lors de la mise à jour du mot de passe",
          details: err.message || "Erreur inconnue lors de la mise à jour"
        },
        { status: 500 }
      );
    }

    if (updateError) {
      console.error("Erreur mise à jour mot de passe:", updateError);
      return NextResponse.json(
        { 
          error: "Erreur lors de la mise à jour du mot de passe",
          details: updateError.message,
          code: updateError.status || updateError.code
        },
        { status: 400 }
      );
    }

    console.log("Mot de passe mis à jour avec succès");

    return NextResponse.json({
      success: true,
      message: "Mot de passe défini avec succès",
      email: email,
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Erreur API set-password (catch général):", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error.message || "Erreur inconnue",
        type: error.name || "UnknownError"
      },
      { status: 500 }
    );
  }
}

