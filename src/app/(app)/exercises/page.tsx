import { createClient } from "@/lib/supabase/server";
import { Exercise } from "@/lib/definitions";
import { DataTable } from "@/components/exercises/data-table";
import { columns } from "@/components/exercises/columns";

async function getExercises(): Promise<Exercise[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar exercícios:", error);
    return [];
  }
  return data as Exercise[];
}

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Biblioteca de Exercícios</h1>
          <p className="text-muted-foreground">Consulte os exercícios disponíveis para montar os treinos.</p>
        </div>
      </div>
      <DataTable columns={columns} data={exercises} />
    </div>
  );
}
