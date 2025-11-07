"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  client_name: string;
  client_email: string;
  project_type: string;
  description: string;
  status: string;
  created_at: string;
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
  uploaded_by: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
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

export default function ClientProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientEmail, setClientEmail] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    // Récupérer l'email depuis l'URL ou le localStorage
    const email = new URLSearchParams(window.location.search).get("email") ||
      localStorage.getItem(`client_email_${projectId}`);
    
    if (email) {
      setClientEmail(email);
      localStorage.setItem(`client_email_${projectId}`, email);
      loadProject(email);
      loadMessages();
      loadFiles();
    } else {
      // Demander l'email si non fourni
      const emailInput = prompt("Veuillez entrer votre email pour accéder à votre projet:");
      if (emailInput) {
        setClientEmail(emailInput);
        localStorage.setItem(`client_email_${projectId}`, emailInput);
        loadProject(emailInput);
        loadMessages();
        loadFiles();
      } else {
        setLoading(false);
      }
    }
  }, [projectId]);

  const loadProject = async (email: string) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("client_email", email)
      .single();

    if (error) {
      console.error("Erreur:", error);
      setLoading(false);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !clientEmail) return;

    setSendingMessage(true);
    const { error } = await supabase.from("messages").insert({
      project_id: projectId,
      sender_type: "client",
      sender_email: clientEmail,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploadingFile(true);
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${projectId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("project-files")
      .upload(fileName, file);

    if (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload du fichier");
      setUploadingFile(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("project-files")
      .getPublicUrl(fileName);

    await supabase.from("project_files").insert({
      project_id: projectId,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: "client",
    });

    loadFiles();
    setUploadingFile(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">Projet non trouvé ou accès non autorisé</div>
        <p className="text-gray-600">
          Vérifiez que vous utilisez le bon email et l'ID de projet correct.
        </p>
      </div>
    );
  }

  const currentStatus = STATUS_LABELS[project.status] || project.status;
  const statusColor = STATUS_COLORS[project.status] || "bg-gray-100 text-gray-800";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mon projet WebStarter</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {currentStatus}
          </span>
          <span className="text-gray-600 text-sm">
            Créé le {new Date(project.created_at).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Informations du projet</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Type:</span> {project.project_type}
            </p>
            <p>
              <span className="font-semibold">Statut:</span> {currentStatus}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Fichiers ({files.length})</h2>
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploadingFile}
            className="border border-gray-300 rounded-md p-2"
            accept="image/*,.pdf,.doc,.docx"
          />
          {uploadingFile && <p className="text-sm text-gray-600 mt-2">Upload en cours...</p>}
        </div>
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
                  Télécharger
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
                  msg.sender_type === "client"
                    ? "bg-blue-50 ml-auto"
                    : "bg-gray-50 mr-auto"
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {msg.sender_type === "client" ? "Vous" : "Admin"}
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

