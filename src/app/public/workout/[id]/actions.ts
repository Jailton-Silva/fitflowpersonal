
'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WorkoutSession } from "@/lib/definitions";

const SESSION_COOKIE_PREFIX = "workout_session_token_";

export async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select(
            '*, students(id, name, email)'
        )
        .eq('id', workoutId)
        .single();
    
    if (error) {
        console.error("Error fetching workout details:", error);
        return null;
    }
    return data;
}


export async function verifyPassword(workoutId: string, token?: string) {
    const cookieStore = cookies();
    const cookieName = `${SESSION_COOKIE_PREFIX}${workoutId}`;

    if (token) {
        cookieStore.set(cookieName, token, {
            path: `/`,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
        });
        return true;
    }

    const sessionToken = cookieStore.get(cookieName)?.value;

    if (!sessionToken) {
        return false;
    }
    
    const supabase = createClient();
    const { data: workout, error } = await supabase
        .from("workouts")
        .select("access_password")
        .eq("id", workoutId)
        .single();

    if (error || !workout) {
        return false;
    }

    return sessionToken === workout.access_password;
}

export async function checkPassword(formData: FormData) {
    const password = formData.get("password") as string;
    const workoutId = formData.get("workoutId") as string;
    
    if (!password || !workoutId) {
        return { error: "ID do treino ou senha não fornecidos." };
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
        const cookieStore = cookies();
        cookieStore.set(`${SESSION_COOKIE_PREFIX}${workoutId}`, password, {
            path: `/`,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
        });
        return { success: true };
    } else {
        return { error: "Senha incorreta." };
    }
}

export async function getWorkoutSession(workoutId: string, studentId: string): Promise<WorkoutSession | null> {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from("workout_sessions")
            .select("*")
            .eq("workout_id", workoutId)
            .eq("student_id", studentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        
        return data;

    } catch (error: any) {
        console.error("[ Server ] Error fetching workout session:", JSON.stringify(error, null, 2));
        return null;
    }
}

export async function startWorkoutSession(workoutId: string, studentId: string): Promise<WorkoutSession | null> {
    const supabase = createClient();
    try {
         const { data, error } = await supabase
            .from("workout_sessions")
            .insert({ workout_id: workoutId, student_id: studentId })
            .select()
            .single();
        
        if (error) throw error;
        
        return data;

    } catch (error: any) {
        console.error("[ Server ] Error starting workout session:", JSON.stringify(error, null, 2));
        return null;
    }
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();
    
    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises')
        .eq('id', sessionId)
        .single();
        
    if (fetchError || !session) {
        return { error: 'Session not found' };
    }

    const currentExercises = new Set(session.completed_exercises || []);
    if (isCompleted) {
        currentExercises.add(exerciseId);
    } else {
        currentExercises.delete(exerciseId);
    }
    
    const updatedExercises = Array.from(currentExercises);

    const { error } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: updatedExercises })
        .eq('id', sessionId);
        
    if (error) {
        console.error("Error updating exercises:", error);
        return { error: error.message };
    }
    
    return { success: true };
}
