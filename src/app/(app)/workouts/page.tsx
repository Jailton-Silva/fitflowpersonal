import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Workout, Student, Exercise } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Dumbbell } from "lucide-react";
import { WorkoutFilters } from "@/components/workouts/workout-filters";

async function getWorkouts(filters: { studentId?: string; exerciseIds?: string[]; from?: string; to?: string; }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) return [];
  
  let query = supabase
    .from("workouts")
    .select("*, students(id, name)")
    .eq("trainer_id", trainer.id)
    .order("created_at", { descending: true });


  if (filters.studentId) {
    query = query.eq('student_id', filters.studentId);
  }
  if (filters.from) {
    query = query.gte('created_at', filters.from);
  }
  if (filters.to) {
    query = query.lte('created_at', filters.to);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Erro ao buscar treinos:", error);
    return [];
  }

  // Post-query filtering for exercises
  if (filters.exerciseIds && filters.exerciseIds.length > 0) {
    return (data as Workout[]).filter(workout => 
      filters.exerciseIds?.every(filterId => 
        (workout.exercises as any[]).some(ex => ex.exercise_id === filterId)
      )
    );
  }

  return data;
}

async function getFilterData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { students: [], exercises: [] };

    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return { students: [], exercises: [] };

    const studentsPromise = supabase.from("students").select("id, name").eq("trainer_id", trainer.id).order('name');
    const exercisesPromise = supabase.from("exercises").select("id, name").eq("trainer_id", trainer.id).order('name');

    const [studentsResult, exercisesResult] = await Promise.all([
        studentsPromise,
        exercisesPromise
    ]);

    return {
        students: (studentsResult.data as Pick<Student, 'id' | 'name'>[]) ?? [],
        exercises: (exercisesResult.data as Pick<Exercise, 'id' | 'name'>[]) ?? [],
    }
}


export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: { student?: string; exercises?: string | string[]; from?: string; to?: string; };
}) {
  const exerciseIds = Array.isArray(searchParams.exercises) ? searchParams.exercises : (searchParams.exercises ? [searchParams.exercises] : []);
  const workouts = await getWorkouts({ 
      studentId: searchParams.student, 
      exerciseIds: exerciseIds,
      from: searchParams.from,
      to: searchParams.to,
  });
  const { students, exercises } = await getFilterData();


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Planos de Treino</h1>
        <Button asChild className="ripple">
          <Link href="/workouts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Treino
          </Link>
        </Button>
      </div>
      
      <WorkoutFilters students={students} exercises={exercises} />
      
      {workouts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(workouts as Workout[]).map((workout: Workout) => (
            <Card key={workout.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription>
                  Para: {workout.students?.name ?? "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  <span>
                    {workout.exercises.length} exercício
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" asChild>
                    <Link href={`/workouts/${workout.id}`}>Ver Plano</Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Nenhum Treino Encontrado</h2>
          <p className="text-muted-foreground mt-2">
            Tente ajustar seus filtros ou crie um novo plano de treino.
          </p>
          <Button asChild className="mt-4 ripple">
            <Link href="/workouts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Treino
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
