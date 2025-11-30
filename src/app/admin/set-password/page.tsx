"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Page pour définir le mot de passe d'un utilisateur existant
 * L'utilisateur doit déjà exister dans Supabase Auth
 */
export default function SetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("slovengama@gmail.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validation
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details || data.error || "Erreur lors de la définition du mot de passe");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Mot de passe défini avec succès !
          </h2>
          <p className="text-gray-600 mb-4">
            Le mot de passe pour <strong>{email}</strong> a été défini.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Définir le mot de passe</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Définissez un mot de passe pour un utilisateur existant
        </p>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <p className="font-semibold mb-1">ℹ️ Important :</p>
          <p>
            Cette page permet de définir un mot de passe pour un utilisateur qui existe déjà 
            dans Supabase Auth mais qui n'a pas de mot de passe défini.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm">{error}</p>
            {error.includes("SUPABASE_SERVICE_ROLE_KEY") && (
              <div className="mt-2 text-xs bg-red-50 p-2 rounded">
                <p className="font-semibold">Solution :</p>
                <p>Ajoutez dans votre fichier .env.local :</p>
                <code className="block mt-1 p-1 bg-white rounded">
                  SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
                </code>
                <p className="mt-1">
                  Vous trouvez cette clé dans Supabase : Settings → API → service_role key
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              placeholder="email@exemple.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              L'utilisateur doit déjà exister dans Supabase Auth
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              placeholder="Retapez le mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Définition en cours..." : "Définir le mot de passe"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/admin/add-admin"
            className="text-sm text-blue-600 hover:underline"
          >
            Ajouter cet utilisateur comme admin →
          </a>
        </div>
      </div>
    </div>
  );
}

