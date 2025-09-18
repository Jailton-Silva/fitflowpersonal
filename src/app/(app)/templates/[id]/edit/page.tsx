
import WorkoutBuilder from "@/components/workouts/workout-builder";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Exercise, Student } from "@/lib/definitions";
import { cookies } from "next/headers";

async function getTemplateData(templateId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
     const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        notFound();
    }
     const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    if (!trainer) {
        notFound();
    }

    const templatePromise = supabase.from("workouts").select("*").eq("id", templateId).eq("trainer_id", trainer.id).is("student_id", null).single();
    const exercisesPromise = supabase.from("exercises").select("*").eq('trainer_id', trainer.id);

    const [templateResult, exercisesResult] = await Promise.all([
        templatePromise,
        exercisesPromise
    ]);

    if (templateResult.error || !templateResult.data) {
        notFound();
    }
    if (exercisesResult.error) {
        console.error("Erro ao buscar exercícios", exercisesResult.error);
    }

    return {
        template: templateResult.data,
        exercises: (exercisesResult.data as Exercise[]) ?? [],
    }
}


export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const { template, exercises } = await getTemplateData(params.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Editar Template de Treino</h1>
      </div>
      <WorkoutBuilder students={[]} exercises={exercises} workout={template} isTemplateMode={true} />
    </div>
  );
}
