import { createClient } from "@/lib/supabase/server";
import { Exercise } from "@/lib/definitions";
import { DataTable } from "@/components/exercises/data-table";
import { columns } from "@/components/exercises/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ExerciseForm from "@/components/exercises/exercise-form";

async function getExercises(): Promise<Exercise[]> {
  const supabase = createClient();
   const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!trainer) {
    return [];
  }

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("trainer_id", trainer.id)
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
          <p className="text-muted-foreground">Consulte e gerencie seus exercícios para montar os treinos.</p>
        </div>
         <ExerciseForm>
            <Button className="ripple">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Exercício
            </Button>
        </ExerciseForm>
      </div>
      <DataTable columns={columns} data={exercises} />
    </div>
  );
}
