
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Workout, Student, Exercise } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dumbbell } from "lucide-react";
import { WorkoutFilters } from "@/components/workouts/workout-filters";
import WorkoutsClientPage from "./client-page";

async function getWorkouts(filters: { studentId?: string; exerciseIds?: string[]; from?: string; to?: string; status?: string }) {
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
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
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
  searchParams: { student?: string; exercises?: string | string[]; from?: string; to?: string; status?: string };
}) {
  const exerciseIds = Array.isArray(searchParams.exercises) ? searchParams.exercises : (searchParams.exercises ? [searchParams.exercises] : []);
  
  const workoutsPromise = getWorkouts({ 
      studentId: searchParams.student, 
      exerciseIds: exerciseIds,
      from: searchParams.from,
      to: searchParams.to,
      status: searchParams.status,
  });
  
  const filterDataPromise = getFilterData();

  const [workouts, { students, exercises }] = await Promise.all([workoutsPromise, filterDataPromise]);

  return <WorkoutsClientPage workouts={workouts as Workout[]} students={students} exercises={exercises} />;
}
