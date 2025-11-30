"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Page simple pour ajouter un utilisateur existant comme admin
 * Ne crée pas d'utilisateur, juste l'ajoute dans admin_users
 */
export default function AddAdminPage() {
  const [email, setEmail] = useState("slovengama@gmail.com");
  const [name, setName] = useState("Admin Principal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Vérifier d'abord que la table admin_users existe
      const { error: checkError } = await supabase
        .from("admin_users")
        .select("email")
        .limit(1);

      if (checkError) {
        // Vérifier si c'est une erreur CORS ou une table manquante
        if (checkError.message?.includes("CORS") || checkError.message?.includes("NetworkError") || checkError.message?.includes("fetch")) {
          setError(
            "Erreur de connexion à Supabase (CORS). Vérifiez que votre domaine est autorisé dans les paramètres Supabase (Settings → API → CORS)."
          );
        } else {
          setError(
            "La table admin_users n'existe pas. Exécutez d'abord le script supabase-admin-setup.sql dans Supabase."
          );
        }
        setLoading(false);
        return;
      }

      // Ajouter l'utilisateur dans admin_users
      const { data, error: insertError } = await supabase
        .from("admin_users")
        .insert({
          email: email,
          name: name,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        // Si l'utilisateur existe déjà, on le met à jour
        if (insertError.code === "23505" || insertError.message.includes("duplicate")) {
          const { error: updateError } = await supabase
            .from("admin_users")
            .update({
              is_active: true,
              name: name,
            })
            .eq("email", email);

          if (updateError) {
            setError(`Erreur lors de la mise à jour: ${updateError.message}`);
            setLoading(false);
            return;
          }

          setSuccess(true);
        } else {
          setError(`Erreur: ${insertError.message}`);
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
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
            Admin ajouté avec succès !
          </h2>
          <p className="text-gray-600 mb-4">
            L'utilisateur <strong>{email}</strong> est maintenant admin.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vous pouvez maintenant vous connecter sur /admin/login
          </p>
          <a
            href="/admin/login"
            className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
          >
            Aller à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Ajouter un Admin</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Ajoutez un utilisateur existant comme administrateur
        </p>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <p className="font-semibold mb-1">ℹ️ Important :</p>
          <p>
            Cette page ajoute un utilisateur <strong>existant</strong> dans Supabase Auth 
            comme admin. L'utilisateur doit déjà exister dans la table <code>users</code> 
            de Supabase Auth.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              placeholder="Nom de l'admin"
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Ajout en cours..." : "Ajouter comme Admin"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-gray-600">
          <p className="font-semibold mb-2">Alternative (via SQL) :</p>
          <p className="mb-2">
            Vous pouvez aussi exécuter directement dans Supabase SQL Editor :
          </p>
          <code className="block bg-white p-2 rounded border text-xs overflow-x-auto">
            INSERT INTO admin_users (email, name, is_active)<br />
            VALUES (&apos;slovengama@gmail.com&apos;, &apos;Admin Principal&apos;, true)<br />
            ON CONFLICT (email) DO UPDATE SET is_active = true;
          </code>
        </div>
      </div>
    </div>
  );
}

