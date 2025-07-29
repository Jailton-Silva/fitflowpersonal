import WorkoutBuilder from "@/components/workouts/workout-builder";
import { createClient } from "@/lib/supabase/server";

async function getWorkoutInitialData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { students: [], exercises: [] };
    }

    const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    if (!trainer) {
        return { students: [], exercises: [] };
    }

    const studentsPromise = supabase.from("students").select("id, name").eq('trainer_id', trainer.id).eq('status', 'active');
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


export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: { student_id?: string };
}) {
  const { students, exercises } = await getWorkoutInitialData();
  const studentId = searchParams.student_id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Criar Novo Treino</h1>
      </div>
      <WorkoutBuilder students={students} exercises={exercises} defaultStudentId={studentId} />
    </div>
  );
}
