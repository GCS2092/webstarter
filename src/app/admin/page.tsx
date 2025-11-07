"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Project = {
  id: string;
  client_name: string;
  client_email: string;
  project_type: string;
  status: string;
  budget: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  "tous",
  "nouvelle",
  "en_analyse",
  "acceptee",
  "refusee",
  "en_cours",
  "termine",
  "en_attente_info",
];

const STATUS_LABELS: Record<string, string> = {
  tous: "Tous",
  nouvelle: "Nouvelle",
  en_analyse: "En analyse",
  acceptee: "Acceptée",
  refusee: "Refusée",
  en_cours: "En cours",
  termine: "Terminé",
  en_attente_info: "En attente d'infos",
};

const STATUS_COLORS: Record<string, string> = {
  nouvelle: "bg-gray-100 text-gray-800",
  en_analyse: "bg-blue-100 text-blue-800",
  acceptee: "bg-green-100 text-green-800",
  refusee: "bg-red-100 text-red-800",
  en_cours: "bg-yellow-100 text-yellow-800",
  termine: "bg-purple-100 text-purple-800",
  en_attente_info: "bg-orange-100 text-orange-800",
};

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, statusFilter, searchQuery]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur:", error);
      return;
    }

    setProjects(data || []);
    setLoading(false);
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filtre par statut
    if (statusFilter !== "tous") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.client_name.toLowerCase().includes(query) ||
          p.client_email.toLowerCase().includes(query) ||
          p.project_type.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  };

  const getStatusCount = (status: string) => {
    if (status === "tous") return projects.length;
    return projects.filter((p) => p.status === status).length;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {STATUS_OPTIONS.map((status) => (
          <div
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-4 border rounded-lg cursor-pointer transition ${
              statusFilter === status
                ? "border-black bg-black text-white"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-2xl font-bold">{getStatusCount(status)}</div>
            <div className="text-sm">{STATUS_LABELS[status]}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Rechercher par nom, email ou type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau des projets */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {projects.length === 0
              ? "Aucune demande pour le moment"
              : "Aucun projet ne correspond aux filtres"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{project.client_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {project.client_email}
                    </td>
                    <td className="px-4 py-3 text-sm">{project.project_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {project.budget || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[project.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_LABELS[project.status] || project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(project.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Affichage de {filteredProjects.length} projet(s) sur {projects.length}
      </div>
    </div>
  );
}
