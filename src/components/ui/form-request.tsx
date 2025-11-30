"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { getDefaultCountryCode, validatePhoneNumber, getPhonePlaceholder } from "@/lib/phone-validation";
import { getDateFormatHint } from "@/lib/date-format";
import { saveFormDraft, loadFormDraft, clearFormDraft, hasFormDraft } from "@/lib/form-storage";
import { getDefaultCurrency, getBudgetOptionsWithCurrency } from "@/lib/currency";
import PreviewModal from "./PreviewModal";

// Schema de validation - les messages seront traduits dynamiquement
const createRequestSchema = (locale: 'fr' | 'en' | 'es', countryCode?: string) => z.object({
  client_name: z.string().min(2, t('error.name.min', locale)),
  client_email: z.string().email(t('error.email.invalid', locale)),
  client_phone: z.string().optional().refine((phone) => {
    if (!phone || phone.trim() === '') return true; // Optionnel
    const validation = validatePhoneNumber(phone, countryCode as any);
    return validation.isValid;
  }, {
    message: t('error.phone.invalid', locale),
  }),
  project_type: z.string().min(1, t('error.type.required', locale)),
  description: z.string().min(10, t('error.description.min', locale)),
  colors: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  inspirations: z.string().optional(),
});

type RequestFormData = z.infer<ReturnType<typeof createRequestSchema>>;

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
  const { locale } = useLocale();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [countryCode, setCountryCode] = useState<string>(getDefaultCountryCode(locale));
  const [showPreview, setShowPreview] = useState(false);
  
  // Mettre à jour le code pays quand la locale change
  useEffect(() => {
    setCountryCode(getDefaultCountryCode(locale));
  }, [locale]);

  // Charger le brouillon au montage
  useEffect(() => {
    const draft = loadFormDraft();
    if (draft) {
      // Restaurer les valeurs du formulaire
      if (draft.client_name) setValue('client_name', draft.client_name);
      if (draft.client_email) setValue('client_email', draft.client_email);
      if (draft.client_phone) setValue('client_phone', draft.client_phone);
      if (draft.project_type) setValue('project_type', draft.project_type);
      if (draft.description) {
        setValue('description', draft.description);
        setDescriptionLength(draft.description.length);
      }
      if (draft.colors) setValue('colors', draft.colors);
      if (draft.budget) {
        setValue('budget', draft.budget);
        setBudgetRange(draft.budget);
      }
      if (draft.deadline) setValue('deadline', draft.deadline);
      if (draft.inspirations) setValue('inspirations', draft.inspirations);
      if (draft.selectedColors) setSelectedColors(draft.selectedColors);
      if (draft.currentStep) setCurrentStep(draft.currentStep);
    }
  }, []); // Seulement au montage

  // Sauvegarder automatiquement le formulaire toutes les 2 secondes
  useEffect(() => {
    if (isSubmitting || submitSuccess) return;
    
    const saveInterval = setInterval(() => {
      const formData = watch();
      saveFormDraft({
        ...formData,
        selectedColors,
        budgetRange,
        currentStep,
      });
    }, 2000); // Sauvegarder toutes les 2 secondes

    return () => clearInterval(saveInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColors, budgetRange, currentStep, isSubmitting, submitSuccess]);

  // Budget prédéfini simplifié - traduit dynamiquement avec devise adaptée
  const currency = getDefaultCurrency(locale);
  const BUDGET_OPTIONS = getBudgetOptionsWithCurrency(locale, currency);

  // Couleurs simplifiées (top 6) - traduites dynamiquement
  const getSimpleColors = () => [
    { name: t('color.blue', locale), hex: "#3B82F6" },
    { name: t('color.red', locale), hex: "#EF4444" },
    { name: t('color.green', locale), hex: "#10B981" },
    { name: t('color.purple', locale), hex: "#8B5CF6" },
    { name: t('color.black', locale), hex: "#000000" },
    { name: t('color.white', locale), hex: "#FFFFFF" },
  ];
  
  const SIMPLE_COLORS = getSimpleColors();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    trigger, // Pour déclencher la validation manuellement
  } = useForm<RequestFormData>({
    resolver: zodResolver(createRequestSchema(locale, countryCode)),
    mode: "onBlur", // Valider au blur pour éviter trop de validations
    reValidateMode: "onChange", // Re-valider après correction
    shouldUnregister: false, // Garder les valeurs même si non enregistrées
  });
  
  // Re-créer le resolver quand le countryCode change
  useEffect(() => {
    // Le resolver sera recréé automatiquement au prochain render
  }, [countryCode]);

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

  const updateColorsValue = () => {
    const colorsString = selectedColors.join(", ");
    setValue("colors", colorsString);
  };

  const handleBudgetSelect = (value: string) => {
    setBudgetRange(value);
    setValue("budget", value);
  };

  const handleNextStep = async () => {
    // Valider uniquement les champs de l'étape 1
    const isValid = await trigger(["client_name", "client_email", "project_type", "description"]);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleSkipStep2 = async () => {
    try {
      // Valider d'abord les champs de l'étape 1
      const isValid = await trigger(["client_name", "client_email", "project_type", "description"]);
      if (isValid) {
        // Soumettre directement sans remplir l'étape 2
        const formData = watch();
        await onSubmit(formData as RequestFormData);
      }
    } catch (error: any) {
      // Capturer silencieusement les erreurs Zod
      if (error?.name !== 'ZodError') {
        console.error("Erreur lors de la soumission:", error);
      }
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
          budget: budgetRange || data.budget || null,
          deadline: data.deadline || null,
          inspirations: data.inspirations || null,
          status: "nouvelle",
        })
        .select()
        .single();

      if (projectError) {
        console.error("Erreur Supabase:", projectError);
        // Vérifier si c'est une erreur CORS
        if (projectError.message?.includes("CORS") || projectError.message?.includes("NetworkError") || projectError.code === "PGRST301") {
          alert("Erreur de connexion. Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez le support.");
        } else {
          alert(`Erreur lors de l'envoi: ${projectError.message || "Erreur inconnue"}`);
        }
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
      clearFormDraft(); // Effacer le brouillon après soumission réussie
      reset();
      setUploadedFiles([]);
      setSelectedColors([]);
      setBudgetRange("");
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
          {t('success.title', locale)}
        </h2>
        <p className="text-green-700 mb-4 text-lg">
          {t('success.message', locale)}
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
          {t('form.title', locale)}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('form.subtitle', locale)}
        </p>
      </div>

      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-black" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {currentStep > 1 ? "✓" : "1"}
            </div>
            <span className="font-semibold hidden sm:inline">{t('form.step1', locale)}</span>
          </div>
          <div className={`h-1 w-16 ${currentStep >= 2 ? "bg-black" : "bg-gray-200"}`}></div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-black" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
            }`}>
              2
            </div>
            <span className="font-semibold hidden sm:inline">{t('form.step2', locale)}</span>
          </div>
        </div>
      </div>

      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          try {
            if (currentStep === 1) {
              // Valider uniquement l'étape 1
              const isValid = await trigger(["client_name", "client_email", "project_type", "description"]);
              if (!isValid) {
                // Attendre que les erreurs soient mises à jour
                await new Promise(resolve => setTimeout(resolve, 100));
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
                return;
              }
              // Passer à l'étape 2
              setCurrentStep(2);
              return;
            }
            // Étape 2 : Afficher la prévisualisation
            const formData = watch();
            setShowPreview(true);
          } catch (error: any) {
            // Capturer silencieusement les erreurs Zod pour éviter qu'elles apparaissent dans la console
            if (error?.name !== 'ZodError') {
              console.error("Erreur lors de la soumission:", error);
            }
          }
        }} 
        className="space-y-8 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100"
        noValidate
      >
        {/* Message d'erreur général */}
        {Object.keys(errors).length > 0 && currentStep === 1 && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="font-semibold text-red-800 mb-2">
              {t('error.general.title', locale)}
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.client_name && <li>{errors.client_name.message}</li>}
              {errors.client_email && <li>{errors.client_email.message}</li>}
              {errors.project_type && <li>{errors.project_type.message}</li>}
              {errors.description && <li>{errors.description.message}</li>}
            </ul>
          </div>
        )}

        {/* ÉTAPE 1 : Informations essentielles */}
        {currentStep === 1 && (
          <>
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
                {t('form.step1.title', locale)}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    {t('form.name.label', locale)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("client_name")}
                    className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                      errors.client_name ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder={t('form.name.placeholder', locale)}
                    aria-label={t('form.name.label', locale)}
                    aria-required="true"
                    aria-invalid={errors.client_name ? "true" : "false"}
                    aria-describedby={errors.client_name ? "name-error" : undefined}
                  />
                  {errors.client_name && (
                    <div id="name-error" className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
                      ⚠️ {errors.client_name.message}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    {t('form.email.label', locale)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register("client_email")}
                    className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                      errors.client_email ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder={t('form.email.placeholder', locale)}
                    aria-label={t('form.email.label', locale)}
                    aria-required="true"
                    aria-invalid={errors.client_email ? "true" : "false"}
                    aria-describedby={errors.client_email ? "email-error" : undefined}
                  />
                  {errors.client_email && (
                    <div id="email-error" className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
                      ⚠️ {errors.client_email.message}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t('form.type.label', locale)} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("project_type")}
                  className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white ${
                    errors.project_type ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  aria-label={t('form.type.label', locale)}
                  aria-required="true"
                  aria-invalid={errors.project_type ? "true" : "false"}
                  aria-describedby={errors.project_type ? "type-error" : undefined}
                >
                  <option value="">{t('form.type.select', locale)}</option>
                  <option value="portfolio">{t('form.type.portfolio', locale)}</option>
                  <option value="ecommerce">{t('form.type.ecommerce', locale)}</option>
                  <option value="blog">{t('form.type.blog', locale)}</option>
                  <option value="corporate">{t('form.type.corporate', locale)}</option>
                  <option value="landing">{t('form.type.landing', locale)}</option>
                  <option value="autre">{t('form.type.other', locale)}</option>
                </select>
                {errors.project_type && (
                  <div id="type-error" className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
                    ⚠️ {errors.project_type.message}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t('form.description.label', locale)} <span className="text-red-500">*</span>
                  <span className={`text-xs ml-2 ${description.length < 10 ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                    ({description.length} {t('form.description.counter', locale)})
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
                  placeholder={t('form.description.placeholder', locale)}
                  aria-label={t('form.description.label', locale)}
                  aria-required="true"
                  aria-invalid={errors.description ? "true" : "false"}
                  aria-describedby={errors.description ? "description-error" : "description-hint"}
                />
                <div id="description-hint" className="text-xs text-gray-500 mt-1">
                  {description.length} / 10 {t('form.description.counter', locale).split(' - ')[0]}
                </div>
                {errors.description && (
                  <div id="description-error" className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
                    <p className="font-semibold">⚠️ {errors.description.message}</p>
                    {description.length < 10 && (
                      <p className="text-xs mt-1">
                        {t('form.description.missing', locale, { count: (10 - description.length).toString() })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bouton étape 1 */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                {t('form.continue', locale)}
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 2 : Détails optionnels */}
        {currentStep === 2 && (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                {t('form.step2.info', locale)}
              </p>
            </div>

            {/* Couleurs simplifiées */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
                {t('form.colors.label', locale)}
              </h2>
              <p className="text-sm text-gray-600">
                {t('form.colors.hint', locale)}
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {SIMPLE_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => toggleColor(color.hex)}
                    className={`relative w-full h-16 rounded-lg border-2 transition-all ${
                      selectedColors.includes(color.hex)
                        ? "border-black ring-2 ring-offset-2 ring-black"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColors.includes(color.hex) && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold drop-shadow-lg">
                        ✓
                      </span>
                    )}
                    <span className={`absolute bottom-1 left-1 right-1 text-xs font-medium ${
                      color.hex === "#000000" || color.hex === "#FFFFFF" ? "text-gray-700" : "text-white"
                    } drop-shadow`}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget simplifié */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
                {t('form.budget.label', locale)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BUDGET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleBudgetSelect(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      budgetRange === option.value
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <span className="font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Téléphone avec validation par pays */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                {t('form.phone.label', locale)} ({t('form.optional', locale)})
              </label>
              <input
                type="tel"
                {...register("client_phone")}
                className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                  errors.client_phone ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                placeholder={getPhonePlaceholder(countryCode as any)}
                aria-label={t('form.phone.label', locale)}
              />
              {errors.client_phone && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  ⚠️ {errors.client_phone.message}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Format: {getPhonePlaceholder(countryCode as any)}
              </p>
            </div>

            {/* Délai et inspirations */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t('form.deadline.label', locale)}
                </label>
                <input
                  type="date"
                  {...register("deadline")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  aria-label={t('form.deadline.label', locale)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: {getDateFormatHint(locale)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t('form.inspirations.label', locale)}
                </label>
                <textarea
                  {...register("inspirations")}
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                  placeholder={t('form.inspirations.placeholder', locale)}
                />
              </div>
            </div>

            {/* Upload de fichiers */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                {t('form.files.label', locale)}
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
                    {t('form.files.click', locale)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('form.files.hint', locale)}
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

            {/* Boutons étape 2 */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                {t('form.back', locale)}
              </button>
              <button
                type="button"
                onClick={handleSkipStep2}
                disabled={isSubmitting}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                {t('form.skip', locale)}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t('form.submitting', locale)}
                  </span>
                ) : (
                  t('form.submit', locale)
                )}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Modal de prévisualisation */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={() => {
          setShowPreview(false);
          handleSubmit(onSubmit)();
        }}
        formData={{
          ...watch(),
          selectedColors,
          budget: budgetRange || watch('budget'),
        }}
        locale={locale}
      />
    </div>
  );
}
