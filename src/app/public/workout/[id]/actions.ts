
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyPassword(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const workoutId = formData.get("workoutId") as string;

  if (!password || !workoutId) {
    return { error: "Senha ou ID do treino ausente." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("access_password")
    .eq("id", workoutId)
    .single();

  if (error || !data) {
    return { error: "Treino não encontrado ou erro no servidor." };
  }

  if (data.access_password === password) {
    cookies().set(`workout_auth_${workoutId}`, "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    // Redirect to the same page to re-trigger the server component render
    redirect(`/public/workout/${workoutId}`);
  } else {
    return { error: "Senha incorreta." };
  }
}


export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();

    // 1. Fetch the current session
    const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('workout_id, completed_exercises')
        .eq('id', sessionId)
        .single();
    
    if (sessionError || !session) {
        return { error: "Sessão de treino não encontrada." };
    }

    // 2. Update the completed_exercises array
    let currentCompleted = session.completed_exercises || [];
    if (isCompleted) {
        // Add exerciseId if it's not already there
        if (!currentCompleted.includes(exerciseId)) {
            currentCompleted.push(exerciseId);
        }
    } else {
        // Remove exerciseId
        currentCompleted = currentCompleted.filter(id => id !== exerciseId);
    }
    
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: currentCompleted })
        .eq('id', sessionId);

    if (updateError) {
        return { error: "Erro ao atualizar o exercício." };
    }

    // 3. Check if all exercises are completed
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('id', session.workout_id)
        .single();
    
    if (workoutError || !workout) {
        return { error: "Treino associado não encontrado." };
    }

    const totalExercises = (workout.exercises as any[]).length;
    const completedCount = currentCompleted.length;

    if (completedCount === totalExercises) {
        // 4. Mark the session as completed
        const { error: completeError } = await supabase
            .from('workout_sessions')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', sessionId);
        
        if (completeError) {
            return { error: "Erro ao finalizar a sessão." };
        }
    } else {
        // If unchecking an exercise, ensure completed_at is null
         const { error: uncompleteError } = await supabase
            .from('workout_sessions')
            .update({ completed_at: null })
            .eq('id', sessionId);
         if (uncompleteError) {
            return { error: "Erro ao reabrir a sessão." };
        }
    }


    revalidatePath(`/public/workout/${session.workout_id}`);
    return { error: null };
}

