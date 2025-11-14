"use client";
import { useState } from "react";

export default function TestEmailPage() {
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const testEmail = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to || "test@example.com",
          type: "confirmation",
          clientName: "Test User",
          projectId: "test-id",
        }),
      });

      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = () => {
    const config = {
      hasGmailUser: !!process.env.NEXT_PUBLIC_GMAIL_USER || "Non configuré",
      hasGmailPassword: !!process.env.NEXT_PUBLIC_GMAIL_APP_PASSWORD || "Non configuré",
    };
    
    alert(`Configuration:\nGMAIL_USER: ${config.hasGmailUser}\nGMAIL_APP_PASSWORD: ${config.hasGmailPassword ? "Configuré" : "Non configuré"}\n\nNote: Les variables d'environnement ne sont pas accessibles côté client. Vérifiez votre fichier .env.local`);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test d'envoi d'email</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Email de destination
          </label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="votre@email.com"
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={testEmail}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Test en cours..." : "Tester l'envoi"}
          </button>
          <button
            onClick={checkConfig}
            className="bg-gray-600 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition"
          >
            Vérifier config
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className={`p-4 border rounded ${
            result.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <p className="font-semibold mb-2">
              {result.ok ? "✅ Succès" : "❌ Erreur"}
            </p>
            <p className="text-sm mb-2">Status HTTP: {result.status}</p>
            <pre className="text-xs bg-white p-3 rounded overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Instructions :</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Vérifiez que GMAIL_USER et GMAIL_APP_PASSWORD sont dans .env.local</li>
            <li>Redémarrez le serveur après avoir ajouté les variables</li>
            <li>Vérifiez les logs du serveur pour voir les erreurs détaillées</li>
            <li>Vérifiez que le mot de passe d'application Gmail est correct</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

