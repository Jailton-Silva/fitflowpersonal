
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function verifyPassword(prevState: { error: string | null }, formData: FormData) {
    const supabase = createClient();
    const password = formData.get("password") as string;
    const workoutId = formData.get("workoutId") as string;

    if (!password || !workoutId) {
        return { error: "ID do treino ou senha não fornecidos." };
    }

    const { data: workout, error } = await supabase
        .from("workouts")
        .select("access_password")
        .eq("id", workoutId)
        .single();
    
    if (error || !workout) {
        return { error: "Treino não encontrado." };
    }

    if (workout.access_password === password) {
        cookies().set(`workout_auth_${workoutId}`, 'true', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        });
        redirect(`/public/workout/${workoutId}`);
    } else {
        return { error: "Senha incorreta. Tente novamente." };
    }
}


export async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select(
            '*, students(id, name, avatar_url), diet_plan'
        )
        .eq('id', workoutId)
        .single();
    
    if (error) {
        console.error('Error fetching workout details:', error);
        return null;
    }

    if (!data.student_id) {
         console.error('Workout has no associated student');
         return { ...data, student_id: null };
    }

    return data;
}

export async function startWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
            workout_id: workoutId,
            student_id: studentId,
            started_at: new Date().toISOString(),
            completed_exercises: []
        })
        .select()
        .single();

    if (error) {
        console.error("Error starting workout session:", error);
        return null;
    }
    
    revalidatePath(`/public/workout/${workoutId}`);
    return data;
}

export async function getWorkoutSession(workoutId: string, studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("workout_sessions")
        .select('*')
        .eq("workout_id", workoutId)
        .eq("student_id", studentId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching workout session:', JSON.stringify(error, null, 2));
        return null;
    }
    
    return data;
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();

    // First, get the current completed exercises
    const { data: session, error: fetchError } = await supabase
        .from("workout_sessions")
        .select("completed_exercises")
        .eq("id", sessionId)
        .single();

    if (fetchError || !session) {
        return { error: "Sessão não encontrada." };
    }

    let completed_exercises = session.completed_exercises || [];

    if (isCompleted) {
        // Add the exerciseId if it's not already there
        if (!completed_exercises.includes(exerciseId)) {
            completed_exercises.push(exerciseId);
        }
    } else {
        // Remove the exerciseId
        completed_exercises = completed_exercises.filter(id => id !== exerciseId);
    }
    
    const { error: updateError } = await supabase
        .from("workout_sessions")
        .update({ completed_exercises })
        .eq("id", sessionId);

    if (updateError) {
        return { error: updateError.message };
    }

    revalidatePath(`/public/workout/[id]`, 'page');
    return { error: null };
}
