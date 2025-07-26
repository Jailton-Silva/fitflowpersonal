
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function verifyPassword(prevState: any, formData: FormData) {
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
        // Set a cookie to remember access
        cookies().set(`workout_access_${workoutId}`, "granted", {
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
        revalidatePath(`/public/workout/${workoutId}`);
        return { error: null };
    } else {
        return { error: "Senha incorreta." };
    }
}

export async function getWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    // Explicitly select columns to ensure RLS policies don't silently fail.
    const { data, error } = await supabase
        .from("workout_sessions")
        .select("id, workout_id, student_id, completed_exercises")
        .eq("workout_id", workoutId)
        .eq("student_id", studentId)
        .maybeSingle();

    if (error) {
        console.error("[ Server ] Error fetching workout session:", JSON.stringify(error, null, 2));
        return { data: null, error: "Could not fetch workout session." };
    }

    return { data, error: null };
}


export async function startWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("workout_sessions")
        .insert({ workout_id: workoutId, student_id: studentId })
        .select()
        .single();
    
    if (error) {
        console.error("[ Server ] Error starting workout session:", error);
        return { data: null, error: "Could not start workout session." };
    }

    return { data, error: null };
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();
    
    // First, fetch the current session to get the completed_exercises array
    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises')
        .eq('id', sessionId)
        .single();

    if (fetchError || !session) {
        console.error("Error fetching session for update:", fetchError);
        return { error: 'Failed to fetch session.' };
    }

    let completedExercises: string[] = session.completed_exercises || [];

    if (isCompleted) {
        // Add the exerciseId if it's not already there
        if (!completedExercises.includes(exerciseId)) {
            completedExercises.push(exerciseId);
        }
    } else {
        // Remove the exerciseId
        completedExercises = completedExercises.filter(id => id !== exerciseId);
    }

    // Now, update the session with the new array
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: completedExercises })
        .eq('id', sessionId);
    
    if (updateError) {
        console.error("Error updating completed exercises:", updateError);
        return { error: 'Failed to update progress.' };
    }

    revalidatePath(`/public/workout/[id]`);
    return { error: null };
}
