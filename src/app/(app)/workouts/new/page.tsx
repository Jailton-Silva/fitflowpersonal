import WorkoutBuilder from "@/components/workouts/workout-builder";
import { createClient } from "@/lib/supabase/server";

async function getStudentsAndExercises() {
    const supabase = createClient();
    const studentsPromise = supabase.from("students").select("id, name").eq('status', 'active');
    const exercisesPromise = supabase.from("exercises").select("*");

    const [studentsResult, exercisesResult] = await Promise.all([studentsPromise, exercisesPromise]);

    if (studentsResult.error) {
        console.error("Erro ao buscar alunos", studentsResult.error);
    }
    if (exercisesResult.error) {
        console.error("Erro ao buscar exercícios", exercisesResult.error);
    }

    return {
        students: studentsResult.data ?? [],
        exercises: exercisesResult.data ?? [],
    }
}


export default async function NewWorkoutPage() {
  const { students, exercises } = await getStudentsAndExercises();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Criar Novo Treino</h1>
      </div>
      <WorkoutBuilder students={students} exercises={exercises} />
    </div>
  );
}
