"use client";

import { useState } from "react";

/**
 * Page de test pour diagnostiquer les problèmes avec l'API set-password
 */
export default function TestSetPasswordPage() {
  const [email, setEmail] = useState("slovengama@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const testAPI = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "test123456" }),
      });

      const data = await response.json();
      setResult({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data,
      });

      if (!response.ok) {
        setError(data.error || data.details || "Erreur inconnue");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
      setResult({
        error: err.message,
        stack: err.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test API set-password</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Mot de passe (laisser vide pour utiliser "test123456")
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="test123456"
              />
            </div>
            <button
              onClick={testAPI}
              disabled={loading}
              className="w-full bg-black text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Test en cours..." : "Tester l'API"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Résultat</h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Status HTTP:</span>{" "}
                <span
                  className={
                    result.ok
                      ? "text-green-600"
                      : result.status >= 500
                      ? "text-red-600"
                      : "text-orange-600"
                  }
                >
                  {result.status} {result.statusText}
                </span>
              </div>
              <div>
                <span className="font-semibold">OK:</span>{" "}
                <span className={result.ok ? "text-green-600" : "text-red-600"}>
                  {result.ok ? "Oui" : "Non"}
                </span>
              </div>
              <div className="mt-4">
                <span className="font-semibold">Réponse complète:</span>
                <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(result.data || result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            🔍 Diagnostic des erreurs 500
          </h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
            <li>
              <strong>Erreur 500 + "Configuration Supabase manquante":</strong>{" "}
              La variable <code>SUPABASE_SERVICE_ROLE_KEY</code> n'est pas
              configurée dans Vercel
            </li>
            <li>
              <strong>Erreur 500 + "Erreur lors de la recherche de
              l'utilisateur":</strong> Problème avec la clé service_role ou
              l'accès à Supabase Auth
            </li>
            <li>
              <strong>Erreur 404 + "Utilisateur non trouvé":</strong> L'email
              n'existe pas dans Supabase Auth
            </li>
            <li>
              <strong>Erreur 400 + "Erreur lors de la mise à jour":</strong>{" "}
              Problème avec la mise à jour du mot de passe (peut être dû à des
              restrictions Supabase)
            </li>
          </ul>
          <div className="mt-4 text-sm text-blue-700">
            <p className="font-semibold">Solution pour erreur 500:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>
                Allez dans Vercel → Settings → Environment Variables
              </li>
              <li>
                Vérifiez que <code>SUPABASE_SERVICE_ROLE_KEY</code> est bien
                définie
              </li>
              <li>
                Redéployez l'application après avoir ajouté/modifié les
                variables
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

