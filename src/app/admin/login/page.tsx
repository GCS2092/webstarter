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

    try {
      // Authentification Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Messages d'erreur plus détaillés
        console.error("Erreur auth détaillée:", authError);
        
        if (authError.message.includes("Invalid login credentials") || 
            authError.message.includes("invalid") ||
            authError.message.includes("400")) {
          setError(
            "Email ou mot de passe incorrect. " +
            "Vérifiez que : 1) Le mot de passe a bien été défini via /admin/set-password, " +
            "2) Vous utilisez exactement le même email, " +
            "3) Le mot de passe est correct. " +
            "Utilisez la page de diagnostic pour vérifier votre configuration."
          );
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Votre email n'est pas confirmé. Vérifiez votre boîte mail.");
        } else {
          setError(`Erreur: ${authError.message}. Code: ${authError.status || 'N/A'}`);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Vérifier si l'utilisateur est admin dans la table admin_users
        const userIsAdmin = await isAdmin(email);

        if (!userIsAdmin) {
          // Déconnexion si l'utilisateur n'est pas admin
          await supabase.auth.signOut();
          setError("Accès refusé. Vous n'êtes pas autorisé à accéder à cette section.");
          setLoading(false);
          return;
        }

        // Utilisateur authentifié et admin confirmé
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_email", email);
        router.push("/admin");
      }
    } catch (err: any) {
      setError("Une erreur est survenue");
      console.error("Erreur:", err);
    } finally {
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

