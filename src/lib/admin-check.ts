import { supabase } from "./supabase";

/**
 * Vérifie si un utilisateur est admin en vérifiant la table admin_users
 */
export async function isAdmin(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("email, is_active")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification admin:", error);
    return false;
  }
}

/**
 * Récupère les informations d'un admin
 */
export async function getAdminInfo(email: string) {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération admin:", error);
    return null;
  }
}

