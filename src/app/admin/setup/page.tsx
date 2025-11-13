"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("slovengama@gmail.com");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Admin Principal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details || data.error || "Erreur lors de la création");
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
            Admin créé avec succès !
          </h2>
          <p className="text-gray-600 mb-4">
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Création Admin</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Créez votre compte administrateur
        </p>

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

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Nom de l'admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="admin@email.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si l'utilisateur existe déjà, le mot de passe sera mis à jour
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création en cours..." : "Créer l'admin"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Cette page permet de créer le premier admin. 
          Après création, utilisez /admin/login pour vous connecter.
        </p>
      </div>
    </div>
  );
}

