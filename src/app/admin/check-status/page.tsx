"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin-check";

export default function CheckAdminStatusPage() {
  const [email, setEmail] = useState("slovengama@gmail.com");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    setResults(null);

    const status: any = {
      email: email,
      checks: [],
    };

    try {
      // 1. Vérifier si l'utilisateur existe dans Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        status.checks.push({
          name: "Utilisateur dans Supabase Auth",
          status: "❌ Non trouvé",
          details: "L'utilisateur n'est pas connecté ou n'existe pas dans Supabase Auth",
        });
      } else {
        status.checks.push({
          name: "Utilisateur dans Supabase Auth",
          status: "✅ Trouvé",
          details: `ID: ${user.id}, Email: ${user.email}`,
        });
      }

      // 2. Vérifier si l'utilisateur est dans admin_users
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single();

      if (adminError || !adminData) {
        status.checks.push({
          name: "Utilisateur dans admin_users",
          status: "❌ Non trouvé",
          details: adminError?.message || "L'utilisateur n'est pas dans la table admin_users",
          solution: "Exécutez: INSERT INTO admin_users (email, name, is_active) VALUES ('" + email + "', 'Admin', true);",
        });
      } else {
        status.checks.push({
          name: "Utilisateur dans admin_users",
          status: "✅ Trouvé",
          details: `Nom: ${adminData.name}, Actif: ${adminData.is_active ? "Oui" : "Non"}`,
        });
      }

      // 3. Vérifier si l'utilisateur est admin (via la fonction)
      const userIsAdmin = await isAdmin(email);
      status.checks.push({
        name: "Vérification isAdmin()",
        status: userIsAdmin ? "✅ Oui" : "❌ Non",
        details: userIsAdmin ? "L'utilisateur est reconnu comme admin" : "L'utilisateur n'est pas reconnu comme admin",
      });

      // 4. Tester la connexion
      status.checks.push({
        name: "Test de connexion",
        status: "ℹ️ À tester",
        details: "Essayez de vous connecter avec cet email et votre mot de passe",
      });

    } catch (err: any) {
      status.checks.push({
        name: "Erreur",
        status: "❌ Erreur",
        details: err.message,
      });
    }

    setResults(status);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Diagnostic Admin</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Vérifiez l'état de configuration de votre compte admin
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Email à vérifier</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              placeholder="email@exemple.com"
            />
            <button
              onClick={checkStatus}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Vérification..." : "Vérifier"}
            </button>
          </div>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-bold mb-2">Résultats pour : {results.email}</h2>
              {results.checks.map((check: any, index: number) => (
                <div key={index} className="mb-4 p-3 bg-white border border-gray-200 rounded">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold">{check.name}</span>
                    <span className="text-lg">{check.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{check.details}</p>
                  {check.solution && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <p className="font-semibold text-blue-800">Solution :</p>
                      <code className="text-blue-700">{check.solution}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <a
                href="/admin/set-password"
                className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition"
              >
                Définir mot de passe
              </a>
              <a
                href="/admin/add-admin"
                className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition"
              >
                Ajouter comme admin
              </a>
              <a
                href="/admin/login"
                className="flex-1 text-center bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition"
              >
                Se connecter
              </a>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <p className="font-semibold mb-1">💡 Astuce :</p>
          <p>
            Si vous venez de définir le mot de passe mais ne pouvez toujours pas vous connecter :
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Vérifiez que l'utilisateur existe dans Supabase Auth</li>
            <li>Vérifiez que l'utilisateur est dans la table admin_users</li>
            <li>Vérifiez que is_active = true dans admin_users</li>
            <li>Assurez-vous d'utiliser le bon email (exactement le même)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

