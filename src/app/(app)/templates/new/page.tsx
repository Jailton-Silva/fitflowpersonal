
import WorkoutBuilder from "@/components/workouts/workout-builder";
import { createClient } from "@/lib/supabase/server";
import { Exercise, Student } from "@/lib/definitions";

async function getTemplateInitialData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { exercises: [] };
    }

    const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    if (!trainer) {
        return { exercises: [] };
    }

    const { data: exercises, error } = await supabase.from("exercises").select("*").eq('trainer_id', trainer.id);

    if (error) {
        console.error("Erro ao buscar exercícios", error);
    }

    return {
        exercises: (exercises as Exercise[]) ?? [],
    }
}


export default async function NewTemplatePage() {
  const { exercises } = await getTemplateInitialData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Criar Novo Template de Treino</h1>
      </div>
      <WorkoutBuilder students={[]} exercises={exercises} isTemplateMode={true} />
    </div>
  );
}
