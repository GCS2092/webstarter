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

// Palette de couleurs prédéfinies
const COLOR_PALETTE = [
  { name: "Bleu", value: "#3B82F6", hex: "#3B82F6" },
  { name: "Rouge", value: "#EF4444", hex: "#EF4444" },
  { name: "Vert", value: "#10B981", hex: "#10B981" },
  { name: "Jaune", value: "#F59E0B", hex: "#F59E0B" },
  { name: "Violet", value: "#8B5CF6", hex: "#8B5CF6" },
  { name: "Rose", value: "#EC4899", hex: "#EC4899" },
  { name: "Orange", value: "#F97316", hex: "#F97316" },
  { name: "Cyan", value: "#06B6D4", hex: "#06B6D4" },
  { name: "Noir", value: "#000000", hex: "#000000" },
  { name: "Blanc", value: "#FFFFFF", hex: "#FFFFFF" },
  { name: "Gris", value: "#6B7280", hex: "#6B7280" },
  { name: "Indigo", value: "#6366F1", hex: "#6366F1" },
];

export default function FormRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState("#000000");
  const [budgetMin, setBudgetMin] = useState(500);
  const [budgetMax, setBudgetMax] = useState(5000);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    mode: "onBlur", // Valider au blur pour une meilleure UX
  });

  const description = watch("description") || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      if (selectedColors.length < 3) {
        setSelectedColors([...selectedColors, color]);
      }
    }
    updateColorsValue();
  };

  const addCustomColor = () => {
    if (!selectedColors.includes(customColor) && selectedColors.length < 3) {
      setSelectedColors([...selectedColors, customColor]);
      updateColorsValue();
    }
  };

  const updateColorsValue = () => {
    const colorsString = selectedColors.join(", ");
    setValue("colors", colorsString);
  };

  const handleBudgetChange = (type: "min" | "max", value: number) => {
    if (type === "min") {
      setBudgetMin(Math.min(value, budgetMax - 100));
      setValue("budget", `${Math.min(value, budgetMax - 100)}€ - ${budgetMax}€`);
    } else {
      setBudgetMax(Math.max(value, budgetMin + 100));
      setValue("budget", `${budgetMin}€ - ${Math.max(value, budgetMin + 100)}€`);
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
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          client_name: data.client_name,
          client_email: data.client_email,
          client_phone: data.client_phone || null,
          project_type: data.project_type,
          description: data.description,
          colors: selectedColors.length > 0 ? selectedColors.join(", ") : data.colors || null,
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

      if (uploadedFiles.length > 0 && project) {
        await uploadFiles(project.id, uploadedFiles);
      }

      // Envoyer l'email de confirmation
      try {
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: data.client_email,
            type: "confirmation",
            projectId: project.id,
            clientName: data.client_name,
          }),
        });

        const emailResult = await emailResponse.json();
        
        if (!emailResult.success) {
          console.error("Erreur envoi email:", emailResult);
          // Ne pas bloquer la soumission si l'email échoue, mais logger l'erreur
          console.warn("Le projet a été créé mais l'email n'a pas pu être envoyé:", emailResult.message || emailResult.error);
        } else {
          console.log("Email de confirmation envoyé avec succès");
        }
      } catch (emailError: any) {
        console.error("Erreur lors de l'appel API email:", emailError);
        // Ne pas bloquer la soumission si l'email échoue
      }

      setSubmitSuccess(true);
      reset();
      setUploadedFiles([]);
      setSelectedColors([]);
      setBudgetMin(500);
      setBudgetMax(5000);
      setDescriptionLength(0);

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
      <div className="max-w-2xl mx-auto p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg animate-fade-in">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-bold text-green-800 mb-3">
          Demande envoyée avec succès !
        </h2>
        <p className="text-green-700 mb-4 text-lg">
          Merci pour votre demande. Notre équipe vous répondra sous 48h.
        </p>
        <p className="text-sm text-green-600">
          Vous recevrez un email de confirmation dans quelques instants.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
          Demande de site web
        </h1>
        <p className="text-gray-600 text-lg">
          Remplissez ce formulaire et nous vous répondrons sous 48h ⚡
        </p>
      </div>

      <form 
        onSubmit={handleSubmit(
          onSubmit,
          (errors) => {
            // Afficher les erreurs de validation
            console.log("Erreurs de validation:", errors);
            // Faire défiler vers la première erreur
            const firstError = Object.keys(errors)[0];
            if (firstError) {
              setTimeout(() => {
                const element = document.querySelector(`[name="${firstError}"]`);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "center" });
                  (element as HTMLElement).focus();
                }
              }, 100);
            }
          }
        )} 
        className="space-y-8 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100"
      >
        {/* Message d'erreur général */}
        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="font-semibold text-red-800 mb-2">
              ⚠️ Veuillez corriger les erreurs suivantes :
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.client_name && <li>{errors.client_name.message}</li>}
              {errors.client_email && <li>{errors.client_email.message}</li>}
              {errors.project_type && <li>{errors.project_type.message}</li>}
              {errors.description && <li>{errors.description.message}</li>}
            </ul>
          </div>
        )}

        {/* Informations personnelles */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
            👤 Informations personnelles
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                {...register("client_name")}
                className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                  errors.client_name ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                placeholder="Votre nom complet"
              />
              {errors.client_name && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  ⚠️ {errors.client_name.message}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("client_email")}
                className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                  errors.client_email ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                placeholder="votre@email.com"
              />
              {errors.client_email && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  ⚠️ {errors.client_email.message}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Téléphone
            </label>
            <input
              type="tel"
              {...register("client_phone")}
              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </div>

        {/* Détails du projet */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
            🎯 Détails du projet
          </h2>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Type de site <span className="text-red-500">*</span>
            </label>
            <select
              {...register("project_type")}
              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white ${
                errors.project_type ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
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
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                ⚠️ {errors.project_type.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Description du projet <span className="text-red-500">*</span>
              <span className={`text-xs ml-2 ${description.length < 10 ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                ({description.length} caractères - minimum 10)
              </span>
            </label>
            <textarea
              {...register("description")}
              onChange={(e) => {
                setDescriptionLength(e.target.value.length);
                register("description").onChange(e);
              }}
              rows={6}
              className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none ${
                errors.description ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
              placeholder="Décrivez votre projet en détail : objectifs, fonctionnalités souhaitées, public cible..."
            />
            {errors.description && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <p className="font-semibold">⚠️ {errors.description.message}</p>
                {description.length < 10 && (
                  <p className="text-xs mt-1">
                    Il manque {10 - description.length} caractère(s) pour valider ce champ.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Palette de couleurs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
            🎨 Couleurs souhaitées
          </h2>
          <p className="text-sm text-gray-600">
            Sélectionnez jusqu'à 3 couleurs (cliquez pour sélectionner/désélectionner)
          </p>

          <div className="grid grid-cols-6 md:grid-cols-8 gap-3">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => toggleColor(color.hex)}
                className={`relative w-12 h-12 rounded-lg border-2 transition-all transform hover:scale-110 ${
                  selectedColors.includes(color.hex)
                    ? "border-black ring-2 ring-offset-2 ring-black scale-110"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColors.includes(color.hex) && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Couleur personnalisée
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="#000000"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addCustomColor}
              disabled={selectedColors.length >= 3 || selectedColors.includes(customColor)}
              className="px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter
            </button>
          </div>

          {selectedColors.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Couleurs sélectionnées :</p>
              <div className="flex gap-2 flex-wrap">
                {selectedColors.map((color) => (
                  <div
                    key={color}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm">{color}</span>
                    <button
                      type="button"
                      onClick={() => toggleColor(color)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Budget avec slider */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
            💰 Budget
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Minimum</label>
                <span className="text-lg font-bold text-gray-900">{budgetMin}€</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={budgetMin}
                onChange={(e) => handleBudgetChange("min", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Maximum</label>
                <span className="text-lg font-bold text-gray-900">{budgetMax}€</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={budgetMax}
                onChange={(e) => handleBudgetChange("max", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>

            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Budget estimé</p>
              <p className="text-2xl font-bold text-gray-900">
                {budgetMin}€ - {budgetMax}€
              </p>
            </div>
          </div>
        </div>

        {/* Délai et inspirations */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Délai souhaité
            </label>
            <input
              type="date"
              {...register("deadline")}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Inspirations / Exemples
            </label>
            <textarea
              {...register("inspirations")}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
              placeholder="Partagez des liens de sites qui vous inspirent..."
            />
          </div>
        </div>

        {/* Upload de fichiers */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            📎 Fichiers (logo, photos, documents)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block"
            >
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-600 mb-1">
                Cliquez pour sélectionner des fichiers
              </p>
              <p className="text-xs text-gray-500">
                Images, PDF, Word (max 50MB par fichier)
              </p>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = [...uploadedFiles];
                      newFiles.splice(index, 1);
                      setUploadedFiles(newFiles);
                    }}
                    className="text-red-500 hover:text-red-700 text-xl"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-black to-gray-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-gray-800 hover:to-black transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Envoi en cours...
            </span>
          ) : (
            "Envoyer la demande 🚀"
          )}
        </button>
      </form>
    </div>
  );
}
