
import WorkoutBuilder from "@/components/workouts/workout-builder";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Exercise, Student } from "@/lib/definitions";

async function getWorkoutData(workoutId: string) {
    const supabase = createClient();
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

    const workoutPromise = supabase.from("workouts").select("*").eq("id", workoutId).eq("trainer_id", trainer.id).single();
    const studentsPromise = supabase.from("students").select("id, name").eq('trainer_id', trainer.id).eq('status', 'active');
    const exercisesPromise = supabase.from("exercises").select("*").eq('trainer_id', trainer.id);

    const [workoutResult, studentsResult, exercisesResult] = await Promise.all([
        workoutPromise,
        studentsPromise,
        exercisesPromise
    ]);

    if (workoutResult.error || !workoutResult.data) {
        notFound();
    }
    if (studentsResult.error) {
        console.error("Erro ao buscar alunos", studentsResult.error);
    }
    if (exercisesResult.error) {
        console.error("Erro ao buscar exercícios", exercisesResult.error);
    }

    return {
        workout: workoutResult.data,
        students: (studentsResult.data as Student[]) ?? [],
        exercises: (exercisesResult.data as Exercise[]) ?? [],
    }
}


export default async function EditWorkoutPage({ params }: { params: { id: string } }) {
  const { workout, students, exercises } = await getWorkoutData(params.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Editar Plano de Treino</h1>
      </div>
      <WorkoutBuilder students={students} exercises={exercises} workout={workout} />
    </div>
  );
}
