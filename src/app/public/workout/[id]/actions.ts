
"use server";

import { createClient } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// This action is used by the password form to verify the password
export async function verifyPassword(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const workoutId = formData.get("workoutId") as string;

  if (!password || !workoutId) {
    return { error: "ID do treino ou senha não fornecidos." };
  }

  // Use admin client to bypass RLS and check the password
  const { data: workout, error } = await supabaseAdmin
    .from("workouts")
    .select("access_password")
    .eq("id", workoutId)
    .single();
    
  if (error || !workout) {
    return { error: "Treino não encontrado." };
  }

  if (workout.access_password !== password) {
    return { error: "Senha incorreta." };
  }

  // If password is correct, set a cookie
  cookies().set(`workout-${workoutId}-auth`, "true", {
    path: `/public/workout/${workoutId}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  revalidatePath(`/public/workout/${workoutId}`);
  return { error: null };
}


// This server action updates the completed exercises for a session
export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();

    // Fetch the current session
    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises, workout_id')
        .eq('id', sessionId)
        .single();

    if (fetchError) {
        console.error("Fetch Error:", fetchError);
        return { error: fetchError.message };
    }

    let completedExercises = session.completed_exercises || [];

    if (isCompleted) {
        if (!completedExercises.includes(exerciseId)) {
            completedExercises.push(exerciseId);
        }
    } else {
        completedExercises = completedExercises.filter(id => id !== exerciseId);
    }
    
    // Check if all exercises are completed
    const { data: workout } = await supabase.from('workouts').select('exercises').eq('id', session.workout_id).single();
    const allExercisesCount = (workout?.exercises as any[])?.length || 0;
    const isWorkoutFinished = allExercisesCount > 0 && completedExercises.length === allExercisesCount;

    // Update the session
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({
            completed_exercises: completedExercises,
            completed_at: isWorkoutFinished ? new Date().toISOString() : null,
        })
        .eq('id', sessionId);
    
    if (updateError) {
        console.error("Update Error:", updateError);
        return { error: updateError.message };
    }
    
    revalidatePath(`/public/workout/${session.workout_id}`);
    return { error: null };
}
