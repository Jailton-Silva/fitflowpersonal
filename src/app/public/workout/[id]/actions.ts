
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name, avatar_url), exercises(id, name, video_url)')
        .eq('id', workoutId)
        .single();
    
    if (error) {
        console.error("Error fetching workout details:", error);
    }
    return { workout: data, error };
}


async function getWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    
    if (!workoutId || !studentId) {
        console.error("Invalid workoutId or studentId for getWorkoutSession");
        return { session: null, error: new Error("Workout ID or Student ID is invalid.") };
    }

    const { data, error } = await supabase
        .from("workout_sessions")
        .select('*')
        .eq("workout_id", workoutId)
        .eq("student_id", studentId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'exact one row was not returned' error
      console.error("Error fetching workout session:", JSON.stringify(error, null, 2));
    }

    return { session: data, error: error?.code === 'PGRST116' ? null : error };
}


async function startWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
            workout_id: workoutId,
            student_id: studentId,
            started_at: new Date().toISOString(),
            completed_exercises: [],
        })
        .select()
        .single();
    
    if (error) console.error("Error starting workout session:", error);

    revalidatePath(`/public/workout/${workoutId}`);
    return { session: data, error };
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();

    const { data: currentSession, error: fetchError } = await supabase
        .from("workout_sessions")
        .select("completed_exercises, workout_id")
        .eq("id", sessionId)
        .single();
    
    if (fetchError) {
        console.error("Failed to fetch session for update:", fetchError);
        return { error: fetchError };
    }

    let currentExercises: string[] = currentSession.completed_exercises || [];
    
    if (isCompleted) {
        if (!currentExercises.includes(exerciseId)) {
            currentExercises.push(exerciseId);
        }
    } else {
        currentExercises = currentExercises.filter(id => id !== exerciseId);
    }
    
    const { error: updateError } = await supabase
        .from("workout_sessions")
        .update({ completed_exercises: currentExercises })
        .eq("id", sessionId);

    if (updateError) {
        console.error("Failed to update completed exercises:", updateError);
        return { error: updateError };
    }

    // Check if all exercises in the workout are now complete
    const { data: workout } = await supabase.from('workouts').select('exercises').eq('id', currentSession.workout_id).single();
    const allWorkoutExercises = (workout?.exercises as any[])?.map(e => e.exercise_id) || [];
    const allCompleted = allWorkoutExercises.every(id => currentExercises.includes(id));

    if (allCompleted) {
        const { error: completeError } = await supabase
            .from('workout_sessions')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', sessionId);

        if (completeError) {
             console.error("Failed to mark session as complete:", completeError);
             return { error: completeError };
        }
    }


    revalidatePath(`/public/workout/${currentSession.workout_id}`);

    return { error: null };
}

export async function verifyPassword(prevState: any, formData: FormData) {
    const password = formData.get("password") as string;
    const workoutId = formData.get("workoutId") as string;
    const supabase = createClient();

    const { data: workout, error } = await supabase
        .from("workouts")
        .select("access_password")
        .eq("id", workoutId)
        .single();
    
    if (error) {
        console.error("Error fetching workout for password verification:", error);
        return { error: "Não foi possível verificar o treino.", success: false };
    }

    if (!workout.access_password) {
        // No password set, allow access
         return { error: null, success: true };
    }

    if (workout.access_password !== password) {
        return { error: "Senha inválida.", success: false };
    }

    // Set cookie
    cookies().set(`workout_access_${workoutId}`, "true", {
        path: `/`, // Set cookie for the whole domain to be accessible on redirect
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 30, // 30 minutes
        sameSite: 'lax',
    });

    return { error: null, success: true };
}
