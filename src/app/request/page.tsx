"use client";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";

export default function RequestPage() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    const { error } = await supabase.from("projects").insert({
      client_name: data.client_name,
      client_email: data.client_email,
      project_type: data.project_type,
      description: data.description,
      colors: data.colors,
      budget: data.budget,
      deadline: data.deadline
    });

    if (error) {
      console.log(error);
      alert("Erreur, réessaye.");
      return;
    }

    alert("✅ Demande envoyée avec succès! Réponse sous 48h.");
    reset();
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Demande de site web</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <input placeholder="Nom complet"
          {...register("client_name")}
          className="w-full border p-2" />

        <input placeholder="Email"
          {...register("client_email")}
          className="w-full border p-2" />

        <input placeholder="Type de site (ex: ecommerce, portfolio...)"
          {...register("project_type")}
          className="w-full border p-2" />

        <textarea placeholder="Décrivez votre projet"
          {...register("description")}
          className="w-full border p-2" />

        <input placeholder="Couleurs souhaitées"
          {...register("colors")}
          className="w-full border p-2" />

        <input placeholder="Budget (optionnel)"
          {...register("budget")}
          className="w-full border p-2" />

        <input placeholder="Deadline (si connue)"
          {...register("deadline")}
          className="w-full border p-2" />

        <button className="bg-black text-white px-4 py-2 rounded">
          Envoyer
        </button>
      </form>
    </div>
  );
}
