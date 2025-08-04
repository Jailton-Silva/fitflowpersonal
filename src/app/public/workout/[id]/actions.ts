
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function verifyPassword(previousState: any, formData: FormData) {
    const workoutId = formData.get('workoutId') as string;
    const password = formData.get('password') as string;
    
    if (!workoutId || !password) {
        return { error: 'ID do treino e senha são obrigatórios.' };
    }

    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select('access_password')
        .eq('id', workoutId)
        .single();
    
    if (error || !data) {
        return { error: 'Treino não encontrado ou erro ao buscar dados.' };
    }

    if (data.access_password === password) {
        cookies().set(`workout-${workoutId}-auth`, 'true', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        });
        revalidatePath(`/public/workout/${workoutId}`);
        redirect(`/public/workout/${workoutId}`);
    } else {
        return { error: 'Senha incorreta.' };
    }
}


export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
  const supabase = createClient();

  // First, fetch the current session to get the existing completed_exercises array
  const { data: sessionData, error: fetchError } = await supabase
    .from("workout_sessions")
    .select("completed_exercises")
    .eq("id", sessionId)
    .single();

  if (fetchError) {
    console.error("Error fetching session:", fetchError);
    return { error: fetchError };
  }

  let completedExercises = sessionData.completed_exercises || [];

  if (isCompleted) {
    // Add the exerciseId if it's not already there
    if (!completedExercises.includes(exerciseId)) {
      completedExercises.push(exerciseId);
    }
  } else {
    // Remove the exerciseId
    completedExercises = completedExercises.filter((id) => id !== exerciseId);
  }

  // Now, update the session with the new array
  const { error: updateError } = await supabase
    .from("workout_sessions")
    .update({ completed_exercises: completedExercises })
    .eq("id", sessionId);

  if (updateError) {
    console.error("Error updating session:", updateError);
    return { error: updateError };
  }

  revalidatePath(`/public/workout/[id]`); // Revalidate the workout page
  return { error: null };
}
