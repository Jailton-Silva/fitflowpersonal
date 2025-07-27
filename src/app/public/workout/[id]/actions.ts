
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyPassword(prevState: any, formData: FormData): Promise<{ error: string | null, success: boolean }> {
  const supabase = createClient();
  const password = formData.get("password") as string;
  const workoutId = formData.get("workoutId") as string;

  const { data: workout, error } = await supabase
    .from("workouts")
    .select("access_password")
    .eq("id", workoutId)
    .single();

  if (error || !workout) {
    return { error: "Treino não encontrado.", success: false };
  }

  if (workout.access_password === password) {
    cookies().set(`workout_auth_${workoutId}`, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: `/`,
    });
    return { error: null, success: true };
  } else {
    return { error: "Senha incorreta.", success: false };
  }
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    "use server"
    const supabase = createClient();

    // First, get the current completed exercises
    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises, workout_id')
        .eq('id', sessionId)
        .single();

    if (fetchError) {
        console.error("Error fetching session:", fetchError);
        return { error: "Failed to fetch session" };
    }

    let completedExercises = session.completed_exercises || [];

    if (isCompleted) {
        if (!completedExercises.includes(exerciseId)) {
            completedExercises.push(exerciseId);
        }
    } else {
        completedExercises = completedExercises.filter(id => id !== exerciseId);
    }

    // Now update the session with the new array
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: completedExercises })
        .eq('id', sessionId);
        
    if (updateError) {
        console.error("Error updating exercises:", updateError);
        return { error: "Failed to update" };
    }

    // Check if all exercises are completed
    const { data: workout } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('id', session.workout_id)
        .single();
    
    if (workout && (workout.exercises as any[]).length === completedExercises.length) {
        const { error: completeError } = await supabase
            .from('workout_sessions')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', sessionId);

        if (completeError) {
             console.error("Error completing session:", completeError);
             return { error: "Failed to complete session" };
        }
    }


    return { error: null };
}
