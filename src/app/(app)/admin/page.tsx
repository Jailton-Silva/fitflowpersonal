
import { createClient } from "@/lib/supabase/server";
import { Trainer } from "@/lib/definitions";
import AdminClientPage from "./client-page";

async function getTrainers() {
    const supabase = createClient();
    
    // This query is now running on the server, bypassing RLS issues for an admin role
    // In a production app, you would have specific RLS policies for admins.
    const { data, error } = await supabase
        .from("trainers")
        .select("*")
        .eq('role', 'trainer')
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching trainers:", error);
        return [];
    }
    
    return data as Trainer[];
}

export default async function AdminPage() {
  const trainers = await getTrainers();

  return (
      <AdminClientPage trainers={trainers} />
  );
}
