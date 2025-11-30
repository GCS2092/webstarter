"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin-check";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Tentative de connexion avec:", { email, passwordLength: password.length });

    try {
      // Authentification Supabase
      console.log("Appel signInWithPassword...");
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log("Réponse auth:", { hasData: !!data, hasError: !!authError, error: authError });

      if (authError) {
        // Messages d'erreur plus détaillés
        console.error("Erreur auth détaillée:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        });
        
        if (authError.message.includes("Invalid login credentials") || 
            authError.message.includes("invalid") ||
            authError.message.includes("400") ||
            authError.status === 400) {
          setError(
            "Email ou mot de passe incorrect. " +
            "Vérifiez que : 1) L'utilisateur existe dans Supabase Auth, " +
            "2) Le mot de passe a bien été défini, " +
            "3) Vous utilisez exactement le même email (stemk2151@gmail.com), " +
            "4) Le mot de passe est correct. " +
            "Utilisez la page de diagnostic (/admin/check-status) pour vérifier votre configuration."
          );
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Votre email n'est pas confirmé. Vérifiez votre boîte mail.");
        } else {
          setError(`Erreur: ${authError.message || "Erreur inconnue"}. Code: ${authError.status || 'N/A'}`);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        console.log("Utilisateur authentifié, vérification admin...", { userId: data.user.id, email: data.user.email });
        
        // Vérifier si l'utilisateur est admin dans la table admin_users
        const userIsAdmin = await isAdmin(email.trim());
        console.log("Résultat vérification admin:", userIsAdmin);

        if (!userIsAdmin) {
          // Déconnexion si l'utilisateur n'est pas admin
          await supabase.auth.signOut();
          setError(
            "Accès refusé. Vous n'êtes pas autorisé à accéder à cette section. " +
            "L'utilisateur existe dans Supabase Auth mais n'est pas dans la table admin_users. " +
            "Utilisez /admin/add-admin pour ajouter cet utilisateur comme admin."
          );
          setLoading(false);
          return;
        }

        // Utilisateur authentifié et admin confirmé
        console.log("Connexion réussie, redirection...");
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_email", email.trim());
        router.push("/admin");
      } else {
        console.error("Aucun utilisateur retourné après l'authentification");
        setError("Aucun utilisateur retourné après l'authentification. Vérifiez vos identifiants.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Erreur catch:", err);
      setError(`Une erreur est survenue: ${err.message || "Erreur inconnue"}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Connexion Admin</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              placeholder="admin@webstarter.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-gray-600">
            Accès réservé aux administrateurs
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Vous n'avez pas encore de mot de passe ?</p>
            <a
              href="/admin/set-password"
              className="text-blue-600 hover:underline font-medium"
            >
              Définir un mot de passe →
            </a>
          </div>
          <div className="text-xs text-gray-500 space-y-1 pt-2">
            <p>Vous n'êtes pas encore admin ?</p>
            <a
              href="/admin/add-admin"
              className="text-blue-600 hover:underline font-medium"
            >
              Ajouter comme admin →
            </a>
          </div>
          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-200 mt-2">
            <p>Problème de connexion ?</p>
            <a
              href="/admin/check-status"
              className="text-orange-600 hover:underline font-medium"
            >
              Diagnostic admin →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

