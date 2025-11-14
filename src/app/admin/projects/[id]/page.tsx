"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Project = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  project_type: string;
  description: string;
  colors: string | null;
  budget: string | null;
  deadline: string | null;
  inspirations: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  sender_type: string;
  sender_email: string;
  message: string;
  created_at: string;
};

type File = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "nouvelle", label: "Nouvelle", color: "bg-gray-100 text-gray-800" },
  { value: "en_analyse", label: "En analyse", color: "bg-blue-100 text-blue-800" },
  { value: "acceptee", label: "Acceptée", color: "bg-green-100 text-green-800" },
  { value: "refusee", label: "Refusée", color: "bg-red-100 text-red-800" },
  { value: "en_cours", label: "En cours", color: "bg-yellow-100 text-yellow-800" },
  { value: "termine", label: "Terminé", color: "bg-purple-100 text-purple-800" },
  { value: "en_attente_info", label: "En attente d'infos", color: "bg-orange-100 text-orange-800" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadProject();
    loadMessages();
    loadFiles();
  }, [projectId]);

  const loadProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Erreur:", error);
      return;
    }

    setProject(data);
    setLoading(false);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const loadFiles = async () => {
    const { data } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (data) setFiles(data);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;

    setUpdating(true);
    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId);

    if (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour du statut");
    } else {
      setProject({ ...project, status: newStatus });

      // Envoyer email automatique
      try {
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: project.client_email,
            type: "status_change",
            projectId: projectId,
            clientName: project.client_name,
            status: newStatus,
          }),
        });

        const emailResult = await emailResponse.json();
        
        if (!emailResult.success) {
          console.error("Erreur envoi email:", emailResult);
          alert(`Le statut a été mis à jour mais l'email n'a pas pu être envoyé: ${emailResult.message || emailResult.error}`);
        } else {
          console.log("Email de changement de statut envoyé avec succès");
        }
      } catch (emailError: any) {
        console.error("Erreur lors de l'appel API email:", emailError);
        alert("Le statut a été mis à jour mais une erreur est survenue lors de l'envoi de l'email.");
      }
    }

    setUpdating(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !project) return;

    setSendingMessage(true);
    const { error } = await supabase.from("messages").insert({
      project_id: projectId,
      sender_type: "admin",
      sender_email: typeof window !== "undefined" ? localStorage.getItem("admin_email") || "admin@webstarter.com" : "admin@webstarter.com",
      message: newMessage,
    });

    if (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'envoi du message");
    } else {
      setNewMessage("");
      loadMessages();
    }

    setSendingMessage(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">Projet non trouvé</div>
        <Link href="/admin" className="text-blue-600 hover:underline">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === project.status);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Retour au dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Projet: {project.client_name}</h1>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentStatus?.color || "bg-gray-100 text-gray-800"
            }`}
          >
            {currentStatus?.label || project.status}
          </span>
          <span className="text-gray-600 text-sm">
            Créé le {new Date(project.created_at).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Informations client</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Nom:</span> {project.client_name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {project.client_email}
            </p>
            {project.client_phone && (
              <p>
                <span className="font-semibold">Téléphone:</span> {project.client_phone}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Détails du projet</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Type:</span> {project.project_type}
            </p>
            {project.budget && (
              <p>
                <span className="font-semibold">Budget:</span> {project.budget}
              </p>
            )}
            {project.deadline && (
              <p>
                <span className="font-semibold">Délai:</span>{" "}
                {new Date(project.deadline).toLocaleDateString("fr-FR")}
              </p>
            )}
            {project.colors && (
              <p>
                <span className="font-semibold">Couleurs:</span> {project.colors}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
        {project.inspirations && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Inspirations:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{project.inspirations}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Changer le statut</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              disabled={updating || project.status === status.value}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                project.status === status.value
                  ? "bg-black text-white cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Fichiers ({files.length})</h2>
        {files.length === 0 ? (
          <p className="text-gray-600">Aucun fichier uploadé</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">{file.file_name}</p>
                  <p className="text-sm text-gray-600">
                    Uploadé par {file.uploaded_by} le{" "}
                    {new Date(file.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Voir
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Messagerie</h2>
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-600">Aucun message</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${
                  msg.sender_type === "admin"
                    ? "bg-blue-50 ml-auto"
                    : "bg-gray-50 mr-auto"
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {msg.sender_type === "admin" ? "Admin" : msg.sender_email}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(msg.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="text-gray-700">{msg.message}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez un message..."
            className="flex-1 border border-gray-300 rounded-md p-2"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={sendingMessage || !newMessage.trim()}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

