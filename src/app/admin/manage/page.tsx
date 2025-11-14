"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "add" | "set-password">("list");

  // Formulaire : Ajouter un admin existant
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  // Formulaire : Définir un mot de passe
  const [passwordEmail, setPasswordEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Réinitialisation de mot de passe pour un admin spécifique
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur:", error);
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    setAddSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from("admin_users")
        .insert({
          email: addEmail,
          name: addName,
          is_active: true,
        });

      if (insertError) {
        if (insertError.code === "23505" || insertError.message.includes("duplicate")) {
          // Mettre à jour si existe déjà
          const { error: updateError } = await supabase
            .from("admin_users")
            .update({
              is_active: true,
              name: addName,
            })
            .eq("email", addEmail);

          if (updateError) {
            setAddError(`Erreur: ${updateError.message}`);
            setAddLoading(false);
            return;
          }
        } else {
          setAddError(`Erreur: ${insertError.message}`);
          setAddLoading(false);
          return;
        }
      }

      setAddSuccess(true);
      setAddEmail("");
      setAddName("");
      loadAdmins();
      setTimeout(() => {
        setAddSuccess(false);
        setActiveTab("list");
      }, 2000);
    } catch (err: any) {
      setAddError(`Erreur: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess(false);

    if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      setPasswordLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: passwordEmail,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.details || data.error || "Erreur lors de la définition du mot de passe");
        setPasswordLoading(false);
        return;
      }

      setPasswordSuccess(true);
      setPasswordEmail("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccess(false);
        setActiveTab("list");
      }, 2000);
    } catch (err: any) {
      setPasswordError("Erreur de connexion au serveur");
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleAdminStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("admin_users")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      loadAdmins();
    }
  };

  const handleResetPassword = async (email: string) => {
    setResetEmail(email);
    setShowResetModal(true);
    setResetPassword("");
    setResetConfirmPassword("");
    setResetError("");
    setResetSuccess(false);
  };

  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess(false);

    if (resetPassword.length < 6) {
      setResetError("Le mot de passe doit contenir au moins 6 caractères");
      setResetLoading(false);
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setResetError("Les mots de passe ne correspondent pas");
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reset-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          newPassword: resetPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.details || data.error || "Erreur lors de la réinitialisation");
        setResetLoading(false);
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        setShowResetModal(false);
        setResetPassword("");
        setResetConfirmPassword("");
        setResetSuccess(false);
      }, 2000);
    } catch (err: any) {
      setResetError("Erreur de connexion au serveur");
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gestion des Administrateurs</h1>
        <p className="text-gray-600">Gérez les administrateurs de la plateforme</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "list"
              ? "border-b-2 border-black text-black"
              : "text-gray-600 hover:text-black"
          }`}
        >
          Liste des admins
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "add"
              ? "border-b-2 border-black text-black"
              : "text-gray-600 hover:text-black"
          }`}
        >
          Ajouter un admin
        </button>
        <button
          onClick={() => setActiveTab("set-password")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "set-password"
              ? "border-b-2 border-black text-black"
              : "text-gray-600 hover:text-black"
          }`}
        >
          Définir un mot de passe
        </button>
      </div>

      {/* Liste des admins */}
      {activeTab === "list" && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold">Liste des administrateurs ({admins.length})</h2>
          </div>
          {admins.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              Aucun administrateur trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{admin.name || "-"}</td>
                      <td className="px-4 py-3">{admin.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            admin.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(admin.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${
                              admin.is_active
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {admin.is_active ? "Désactiver" : "Activer"}
                          </button>
                          <button
                            onClick={() => handleResetPassword(admin.email)}
                            className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            title="Réinitialiser le mot de passe"
                          >
                            🔑 Réinitialiser
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Formulaire : Ajouter un admin */}
      {activeTab === "add" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Ajouter un administrateur</h2>
          <p className="text-sm text-gray-600 mb-6">
            Ajoutez un utilisateur existant dans Supabase Auth comme administrateur.
            L'utilisateur doit déjà exister dans la table users de Supabase Auth.
          </p>

          {addError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {addError}
            </div>
          )}

          {addSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Admin ajouté avec succès !
            </div>
          )}

          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Nom de l'admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="email@exemple.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                L'utilisateur doit déjà exister dans Supabase Auth
              </p>
            </div>

            <button
              type="submit"
              disabled={addLoading}
              className="w-full bg-black text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {addLoading ? "Ajout en cours..." : "Ajouter comme Admin"}
            </button>
          </form>
        </div>
      )}

      {/* Formulaire : Définir un mot de passe */}
      {activeTab === "set-password" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Définir un mot de passe</h2>
          <p className="text-sm text-gray-600 mb-6">
            Définissez un mot de passe pour un utilisateur existant dans Supabase Auth.
            L'utilisateur doit déjà exister dans la table users.
          </p>

          {passwordError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {passwordError}
              {passwordError.includes("SUPABASE_SERVICE_ROLE_KEY") && (
                <div className="mt-2 text-xs bg-red-50 p-2 rounded">
                  <p className="font-semibold">Solution :</p>
                  <p>Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env.local</p>
                </div>
              )}
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Mot de passe défini avec succès !
            </div>
          )}

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={passwordEmail}
                onChange={(e) => setPasswordEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="email@exemple.com"
              />
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
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Retapez le mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-black text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {passwordLoading ? "Définition en cours..." : "Définir le mot de passe"}
            </button>
          </form>
        </div>
      )}

      {/* Modal de réinitialisation de mot de passe */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Réinitialiser le mot de passe</h2>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Important :</p>
              <p>
                Les mots de passe sont hashés et ne peuvent pas être récupérés en clair.
                Vous pouvez uniquement définir un nouveau mot de passe.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Réinitialiser le mot de passe pour : <strong>{resetEmail}</strong>
            </p>

            {resetError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                Mot de passe réinitialisé avec succès !
              </div>
            )}

            <form onSubmit={submitResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Retapez le mot de passe"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {resetLoading ? "Réinitialisation..." : "Réinitialiser"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

