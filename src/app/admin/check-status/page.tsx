"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin-check";

export default function CheckAdminStatusPage() {
  const [email, setEmail] = useState("slovengama@gmail.com");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createPassword, setCreatePassword] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    setResults(null);

    const status: any = {
      email: email,
      checks: [],
    };

    try {
      // 1. Vérifier si l'utilisateur existe dans Supabase Auth
      // Note: On ne peut pas vérifier directement sans être connecté, donc on vérifie via l'API
      let userExistsInAuth = false;
      let authDetails = "";
      
      try {
        // Essayer de vérifier via l'API create-admin en mode "check_only"
        const checkResponse = await fetch("/api/create-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            password: "check_only", // Mot de passe spécial pour juste vérifier
            name: "Check" 
          }),
        });
        
        const checkData = await checkResponse.json();
        
        if (checkResponse.ok && checkData.exists === true) {
          userExistsInAuth = true;
          authDetails = `Utilisateur existe dans Supabase Auth${checkData.userId ? ` (ID: ${checkData.userId})` : ""}`;
        } else if (checkData.exists === false) {
          authDetails = "L'utilisateur n'existe pas dans Supabase Auth";
        } else if (checkData.error?.includes("Configuration") || checkData.error?.includes("SUPABASE_SERVICE_ROLE_KEY")) {
          // Si la clé service_role n'est pas configurée, on ne peut pas vérifier
          authDetails = "Impossible de vérifier (SUPABASE_SERVICE_ROLE_KEY non configurée dans Vercel)";
        } else {
          authDetails = checkData.message || checkData.error || "L'utilisateur n'existe pas dans Supabase Auth";
          // Si on a un userId, l'utilisateur existe
          if (checkData.userId) {
            userExistsInAuth = true;
          }
        }
      } catch (checkErr: any) {
        authDetails = `Erreur lors de la vérification: ${checkErr.message || "Erreur inconnue"}`;
      }
      
      status.checks.push({
        name: "Utilisateur dans Supabase Auth",
        status: userExistsInAuth ? "✅ Trouvé" : "❌ Non trouvé",
        details: authDetails,
        needsCreation: !userExistsInAuth,
      });

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

            {/* Bouton pour créer l'utilisateur dans Supabase Auth si nécessaire */}
            {results.checks.some((check: any) => check.needsCreation) && !showCreateForm && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded">
                <p className="text-sm text-orange-800 mb-3">
                  ⚠️ L'utilisateur n'existe pas dans Supabase Auth. Vous devez le créer pour pouvoir vous connecter.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-700 transition"
                >
                  Créer l'utilisateur dans Supabase Auth
                </button>
              </div>
            )}

            {showCreateForm && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold mb-2">Créer l'utilisateur dans Supabase Auth</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                    <input
                      type="password"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      minLength={6}
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!createPassword || createPassword.length < 6) {
                          alert("Le mot de passe doit contenir au moins 6 caractères");
                          return;
                        }
                        setCreatingUser(true);
                        try {
                          const response = await fetch("/api/create-admin", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              email,
                              password: createPassword,
                              name: results.checks.find((c: any) => c.name === "Utilisateur dans admin_users")?.details?.includes("Nom:") 
                                ? results.checks.find((c: any) => c.name === "Utilisateur dans admin_users").details.split("Nom: ")[1]?.split(",")[0]?.trim() || "Admin"
                                : "Admin",
                            }),
                          });
                          const data = await response.json();
                          if (response.ok) {
                            alert("✅ Utilisateur créé avec succès dans Supabase Auth ! Vous pouvez maintenant vous connecter.");
                            setShowCreateForm(false);
                            setCreatePassword("");
                            // Re-vérifier le statut
                            setTimeout(() => checkStatus(), 1000);
                          } else {
                            alert(`Erreur: ${data.error || data.details || "Erreur inconnue"}`);
                          }
                        } catch (err: any) {
                          alert(`Erreur: ${err.message}`);
                        } finally {
                          setCreatingUser(false);
                        }
                      }}
                      disabled={creatingUser || !createPassword || createPassword.length < 6}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {creatingUser ? "Création..." : "Créer l'utilisateur"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setCreatePassword("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

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

