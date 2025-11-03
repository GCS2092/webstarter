import { supabase } from "@/lib/supabase";

export default async function AdminDashboard() {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Erreur: {error.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>

      {!projects?.length && <p>Aucune demande pour le moment</p>}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {projects?.map((p: any) => (
            <tr key={p.id} className="border">
              <td className="p-2 border">{p.client_name}</td>
              <td className="p-2 border">{p.client_email}</td>
              <td className="p-2 border">{p.project_type}</td>
              <td className="p-2 border">{p.status}</td>
              <td className="p-2 border">
                {new Date(p.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
