"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const requestSchema = z.object({
  client_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  client_email: z.string().email("Email invalide"),
  client_phone: z.string().optional(),
  project_type: z.string().min(1, "Veuillez indiquer le type de site"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  colors: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  inspirations: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function FormRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (projectId: string, files: File[]) => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${projectId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("project-files")
        .upload(fileName, file);

      if (error) {
        console.error("Erreur upload:", error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("project-files")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);

      // Enregistrer dans la table project_files
      await supabase.from("project_files").insert({
        project_id: projectId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: "client",
      });
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);

    try {
      // Insérer le projet
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          client_name: data.client_name,
          client_email: data.client_email,
          client_phone: data.client_phone || null,
          project_type: data.project_type,
          description: data.description,
          colors: data.colors || null,
          budget: data.budget || null,
          deadline: data.deadline || null,
          inspirations: data.inspirations || null,
          status: "nouvelle",
        })
        .select()
        .single();

      if (projectError) {
        throw projectError;
      }

      // Upload des fichiers si présents
      if (uploadedFiles.length > 0 && project) {
        await uploadFiles(project.id, uploadedFiles);
      }

      // Envoyer email de confirmation (via API route)
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: data.client_email,
            type: "confirmation",
            projectId: project.id,
            clientName: data.client_name,
          }),
        });
      } catch (emailError) {
        console.error("Erreur envoi email:", emailError);
        // Ne pas bloquer si l'email échoue
      }

      setSubmitSuccess(true);
      reset();
      setUploadedFiles([]);

      // Rediriger après 3 secondes
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-green-50 border border-green-200 rounded-lg">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Demande envoyée avec succès !
        </h2>
        <p className="text-green-700 mb-4">
          Merci pour votre demande. Notre équipe vous répondra sous 48h.
        </p>
        <p className="text-sm text-green-600">
          Vous recevrez un email de confirmation dans quelques instants.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Demande de site web</h1>
      <p className="text-gray-600 mb-6">
        Remplissez ce formulaire et nous vous répondrons sous 48h.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            {...register("client_name")}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Votre nom complet"
          />
          {errors.client_name && (
            <p className="text-red-500 text-sm mt-1">{errors.client_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("client_email")}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="votre@email.com"
          />
          {errors.client_email && (
            <p className="text-red-500 text-sm mt-1">{errors.client_email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            type="tel"
            {...register("client_phone")}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="+33 6 12 34 56 78"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Type de site <span className="text-red-500">*</span>
          </label>
          <select
            {...register("project_type")}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Sélectionnez un type</option>
            <option value="portfolio">Portfolio / Site vitrine</option>
            <option value="ecommerce">E-commerce</option>
            <option value="blog">Blog</option>
            <option value="corporate">Site corporate</option>
            <option value="landing">Landing page</option>
            <option value="autre">Autre</option>
          </select>
          {errors.project_type && (
            <p className="text-red-500 text-sm mt-1">{errors.project_type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description du projet <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description")}
            rows={5}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Décrivez votre projet en détail..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Couleurs souhaitées</label>
          <input
            {...register("colors")}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Ex: Bleu et blanc, ou #1E40AF et #FFFFFF"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Budget (optionnel)</label>
          <input
            {...register("budget")}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Ex: 1000€ - 2000€"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Délai souhaité</label>
          <input
            type="date"
            {...register("deadline")}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Inspirations / Exemples de sites
          </label>
          <textarea
            {...register("inspirations")}
            rows={3}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Partagez des liens de sites qui vous inspirent..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fichiers (logo, photos, etc.)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
            accept="image/*,.pdf,.doc,.docx"
          />
          {uploadedFiles.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {uploadedFiles.length} fichier(s) sélectionné(s)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
        </button>
      </form>
    </div>
  );
}

