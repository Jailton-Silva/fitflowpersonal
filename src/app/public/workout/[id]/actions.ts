
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getWorkoutDetails(workoutId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select(
      "*, students(id, name, avatar_url)"
    )
    .eq("id", workoutId)
    .single();

  if (error) {
    console.error("Error fetching workout details:", error);
    return null;
  }
  return data;
}

export async function verifyPassword(prevState: any, formData: FormData) {
    const password = formData.get('password') as string;
    const workoutId = formData.get('workoutId') as string;

    const supabase = createClient();
    const { data: workout } = await supabase.from('workouts').select('access_password').eq('id', workoutId).single();

    if (workout?.access_password === password) {
        cookies().set(`workout_access_${workoutId}`, 'true', {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 3600, // 1 hour
        });
        redirect(`/public/workout/${workoutId}`);
    } else {
        return { error: 'Senha incorreta. Tente novamente.' };
    }
}

// Session Management
export async function getWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('workout_id', workoutId)
        .eq('student_id', studentId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching workout session:", JSON.stringify(error, null, 2));
    }
    return data;
}

export async function startWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workout_sessions')
        .insert({ workout_id: workoutId, student_id: studentId })
        .select()
        .single();
    
    if (error) {
         console.error("Error starting workout session:", error);
         return { error };
    }
    revalidatePath(`/public/workout/${workoutId}`);
    return { data };
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();
    
    // 1. Get current session
    const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises, workout_id')
        .eq('id', sessionId)
        .single();

    if (sessionError) return { error: sessionError.message };

    // 2. Update completed exercises list
    let currentExercises = session.completed_exercises || [];
    if (isCompleted) {
        if (!currentExercises.includes(exerciseId)) {
            currentExercises.push(exerciseId);
        }
    } else {
        currentExercises = currentExercises.filter(id => id !== exerciseId);
    }
    
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: currentExercises })
        .eq('id', sessionId);

    if (updateError) return { error: updateError.message };

    // 3. Check if all exercises are completed
     const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('id', session.workout_id)
        .single();

    if (workoutError) return { error: workoutError.message };
    
    const totalExercises = (workout.exercises as any[]).length;
    if (currentExercises.length === totalExercises) {
        // Mark session as complete
        const { error: completeError } = await supabase
            .from('workout_sessions')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', sessionId);
        
        if (completeError) return { error: completeError.message };
    } else {
        // Ensure completed_at is null if not all exercises are done
         const { error: uncompleteError } = await supabase
            .from('workout_sessions')
            .update({ completed_at: null })
            .eq('id', sessionId);

        if (uncompleteError) return { error: uncompleteError.message };
    }
    
    revalidatePath(`/public/workout/${sessionId}`);
    return { error: null };
}
