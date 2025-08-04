
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { notFound } from "next/navigation";

// This file was implicitly expected by other components but never created.
// It centralizes all server actions related to the public workout pages.

export async function verifyPassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  const workoutId = formData.get('workoutId') as string;
  const supabase = createClient();
  
  const { data: workout, error } = await supabase
    .from('workouts')
    .select('access_password')
    .eq('id', workoutId)
    .single();

  if (error || !workout) {
    return { error: 'Treino não encontrado.' };
  }

  if (workout.access_password === password) {
    cookies().set(`workout-${workoutId}-auth`, 'true', { path: '/', maxAge: 60 * 60 * 24 }); // 24-hour auth
    revalidatePath(`/public/workout/${workoutId}`);
    return { error: null };
  } else {
    return { error: 'Senha incorreta.' };
  }
}


export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();
    
    // First, get the current session
    const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises, workout_id')
        .eq('id', sessionId)
        .single();
    
    if (sessionError || !session) {
        return { error: "Sessão não encontrada." };
    }
    
    let currentCompleted = (session.completed_exercises as string[]) || [];

    if (isCompleted) {
        // Add exerciseId if it's not already there
        if (!currentCompleted.includes(exerciseId)) {
            currentCompleted.push(exerciseId);
        }
    } else {
        // Remove exerciseId
        currentCompleted = currentCompleted.filter(id => id !== exerciseId);
    }
    
    // Update the session with the new array
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: currentCompleted })
        .eq('id', sessionId);
        
    if (updateError) {
        return { error: updateError.message };
    }

    // Now, check if all exercises for the workout are completed
    const { data: workout } = await supabase.from('workouts').select('exercises').eq('id', session.workout_id).single();
    const totalExercises = (workout?.exercises as any[])?.length ?? 0;

    if (totalExercises > 0 && currentCompleted.length === totalExercises) {
        const { error: finalUpdateError } = await supabase.from('workout_sessions').update({ completed_at: new Date().toISOString() }).eq('id', sessionId);
         if (finalUpdateError) {
            return { error: finalUpdateError.message };
        }
    }

    revalidatePath(`/public/workout/[id]`);
    return { error: null };
}

export async function finishWorkoutSession(sessionId: string) {
    const supabase = createClient();
    
    const { error } = await supabase
        .from('workout_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId);
        
    if (error) {
        return { error: "Não foi possível finalizar a sessão." };
    }

    revalidatePath(`/public/workout/[id]`);
    return { error: null };
}

