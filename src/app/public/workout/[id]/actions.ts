
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const passwordSchema = z.string().min(1, "A senha é obrigatória");

export async function verifyPassword(prevState: any, formData: FormData) {
    const password = formData.get("password") as string;
    const workoutId = formData.get("workoutId") as string;
    const cookieStore = cookies();
    
    const validatedPassword = passwordSchema.safeParse(password);

    if (!validatedPassword.success) {
        return { error: "Senha inválida." };
    }

    const supabase = createClient();
    const { data: workout, error } = await supabase
        .from("workouts")
        .select("access_password")
        .eq("id", workoutId)
        .single();
    
    if (error || !workout) {
        return { error: "Treino não encontrado ou erro ao buscar." };
    }

    if (workout.access_password === password) {
        cookieStore.set(`workout_access_${workoutId}`, "true", {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 horas
        });
        revalidatePath(`/public/workout/${workoutId}`);
        return { success: true };
    } else {
        return { error: "Senha incorreta." };
    }
}

export async function getWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('workout_id', workoutId)
        .eq('student_id', studentId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching workout session:", error);
        return null;
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
        return null;
    }
    return data;
}


export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();
    
    // First, fetch the current list of completed exercises
    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises')
        .eq('id', sessionId)
        .single();

    if (fetchError || !session) {
        return { error: 'Failed to fetch session' };
    }

    const completedExercises = Array.isArray(session.completed_exercises) ? session.completed_exercises : [];

    let updatedList;
    if (isCompleted) {
        // Add the exerciseId if it's not already there
        if (!completedExercises.includes(exerciseId)) {
            updatedList = [...completedExercises, exerciseId];
        } else {
            updatedList = completedExercises;
        }
    } else {
        // Remove the exerciseId
        updatedList = completedExercises.filter((id: string) => id !== exerciseId);
    }
    
    // Now, update the record with the new list
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: updatedList })
        .eq('id', sessionId);
    
    if (updateError) {
        return { error: 'Failed to update progress' };
    }

    revalidatePath('/public/workout/.*'); // Revalidate relevant path
    return { error: null };
}

