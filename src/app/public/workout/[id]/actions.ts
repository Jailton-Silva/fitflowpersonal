
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyPassword(prevState: any, formData: FormData) {
  const workoutId = formData.get("workoutId") as string;
  const password = formData.get("password") as string;
  
  if (!workoutId || !password) {
    return { error: "ID do treino e senha são obrigatórios." };
  }

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
    cookies().set(`workout_auth_${workoutId}`, "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    // Redirect to the same page, the page logic will handle showing the content
    redirect(`/public/workout/${workoutId}`);
  } else {
    return { error: "Senha incorreta. Tente novamente." };
  }
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();

    // First, get the current list of completed exercises
    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises')
        .eq('id', sessionId)
        .single();

    if (fetchError) {
        console.error("Error fetching session for update:", fetchError);
        return { error: fetchError.message };
    }

    let completedExercises = session.completed_exercises || [];

    if (isCompleted) {
        // Add the exerciseId if it's not already there
        if (!completedExercises.includes(exerciseId)) {
            completedExercises.push(exerciseId);
        }
    } else {
        // Remove the exerciseId
        completedExercises = completedExercises.filter(id => id !== exerciseId);
    }
    
    // Now, update the record
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: completedExercises })
        .eq('id', sessionId);
    
    if (updateError) {
        console.error("Error updating completed exercises:", updateError);
        return { error: updateError.message };
    }

    return { error: null };
}

