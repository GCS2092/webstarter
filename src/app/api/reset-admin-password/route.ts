import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API Route pour réinitialiser le mot de passe d'un admin
 * Utilise la clé service_role pour accéder à l'API admin de Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email et nouveau mot de passe requis" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Utiliser la clé service_role
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

    // Chercher l'utilisateur par email
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json(
        { 
          error: "Erreur lors de la recherche de l'utilisateur",
          details: listError.message 
        },
        { status: 500 }
      );
    }

    const user = usersData?.users?.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { 
          error: "Utilisateur non trouvé",
          details: `Aucun utilisateur trouvé avec l'email: ${email}`
        },
        { status: 404 }
      );
    }

    // Réinitialiser le mot de passe
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      console.error("Erreur réinitialisation mot de passe:", updateError);
      return NextResponse.json(
        { 
          error: "Erreur lors de la réinitialisation du mot de passe",
          details: updateError.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
      email: email,
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Erreur API reset-admin-password:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

