
import { createClient } from "@/lib/supabase/server";
import { Trainer } from "@/lib/definitions";
import AdminClientPage from "./client-page";

async function getTrainers() {
    const supabase = createClient();
    const PAGE_SIZE = 1000;
    let allTrainers: Trainer[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from("trainers")
            .select("*")
            .eq('role', 'trainer')
            .order("created_at", { ascending: false })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
            console.error("Error fetching trainers:", error);
            return [];
        }

        if (data && data.length > 0) {
            allTrainers = allTrainers.concat(data);
            page++;
        } else {
            hasMore = false;
        }
    }
    
    return allTrainers as Trainer[];
}

export default async function AdminPage() {
  const trainers = await getTrainers();

  return (
      <AdminClientPage trainers={trainers} />
  );
}
