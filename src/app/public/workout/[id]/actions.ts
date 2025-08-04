
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Workout } from "@/lib/definitions";

export async function verifyPassword(
  prevState: { error: string | null } | null,
  formData: FormData
) {
  const password = formData.get("password") as string;
  const workoutId = formData.get("workoutId") as string;

  const supabase = createClient();
  const { data: workout, error } = await supabase
    .from("workouts")
    .select("access_password")
    .eq("id", workoutId)
    .single();

  if (error || !workout) {
    return { error: "Treino não encontrado." };
  }

  if (workout.access_password === password) {
    cookies().set(`workout-${workoutId}-auth`, "true", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    revalidatePath(`/public/workout/${workoutId}`);
    return { error: null };
  } else {
    return { error: "Senha incorreta." };
  }
}

export async function updateCompletedExercises(
  sessionId: string,
  exerciseId: string,
  isCompleted: boolean
) {
  const supabase = createClient();

  const { data: session, error: fetchError } = await supabase
    .from("workout_sessions")
    .select("completed_exercises")
    .eq("id", sessionId)
    .single();

  if (fetchError || !session) {
    return { error: "Sessão não encontrada." };
  }

  let currentExercises = session.completed_exercises || [];

  if (isCompleted) {
    if (!currentExercises.includes(exerciseId)) {
      currentExercises.push(exerciseId);
    }
  } else {
    currentExercises = currentExercises.filter((id) => id !== exerciseId);
  }

  const { error: updateError } = await supabase
    .from("workout_sessions")
    .update({ completed_exercises: currentExercises })
    .eq("id", sessionId);

  if (updateError) {
    return { error: `Erro ao atualizar: ${updateError.message}` };
  }

  return { error: null };
}

export async function finishWorkoutSession(sessionId: string) {
    const supabase = createClient();
  
    // First, get the session to find out the workout_id
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('workout_id')
      .eq('id', sessionId)
      .single();
  
    if (sessionError || !session) {
      return { error: 'Sessão de treino não encontrada.' };
    }
  
    // Then, get the workout to get all its exercise IDs
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('exercises')
      .eq('id', session.workout_id)
      .single();
  
    if (workoutError || !workout) {
      return { error: 'Plano de treino não encontrado.' };
    }
  
    // Create an array of all exercise_ids from the workout
    const allExerciseIds = (workout.exercises as any[]).map(ex => ex.exercise_id);
  
    // Now, update the session with the completed_at timestamp and all exercise IDs
    const { error: updateError } = await supabase
      .from('workout_sessions')
      .update({
        completed_at: new Date().toISOString(),
        completed_exercises: allExerciseIds,
      })
      .eq('id', sessionId);
  
    if (updateError) {
      return { error: `Erro ao finalizar treino: ${updateError.message}` };
    }
  
    revalidatePath(`/public/workout/${session.workout_id}`);
    revalidatePath(`/public/student/${(workout as any).student_id}/portal`);
    return { error: null };
  }
