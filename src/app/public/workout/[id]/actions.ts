
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';

export async function verifyPassword(prevState: any, formData: FormData) {
    const password = formData.get('password') as string;
    const workoutId = formData.get('workoutId') as string;
    const supabase = createClient();

    const { data, error } = await supabase
        .from('workouts')
        .select('access_password')
        .eq('id', workoutId)
        .single();
    
    if (error || !data) {
        return { error: 'Treino não encontrado.' };
    }

    if (data.access_password === password) {
        cookies().set(`workout-${workoutId}-auth`, 'true', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        revalidatePath(`/public/workout/${workoutId}`);
        return { error: null };
    } else {
        return { error: 'Senha incorreta.' };
    }
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();

    // 1. Fetch the current session
    const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises, workout_id')
        .eq('id', sessionId)
        .single();

    if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return { error: 'Sessão não encontrada.' };
    }

    // 2. Update the completed exercises array
    let currentCompleted = session.completed_exercises || [];
    if (isCompleted) {
        if (!currentCompleted.includes(exerciseId)) {
            currentCompleted.push(exerciseId);
        }
    } else {
        currentCompleted = currentCompleted.filter(id => id !== exerciseId);
    }
    
    const { data: updatedSession, error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: currentCompleted })
        .eq('id', sessionId)
        .select('completed_exercises')
        .single();

    if (updateError) {
        console.error("Error updating session exercises:", updateError);
        return { error: 'Erro ao atualizar exercício.' };
    }

    // 3. Check if the workout is fully completed
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('id', session.workout_id)
        .single();
    
    if (workoutError || !workout) {
        console.error("Error fetching workout for completion check:", workoutError);
        return { error: 'Erro ao verificar o plano de treino.' };
    }

    const totalExercises = (workout.exercises as any[]).length;
    const completedCount = updatedSession.completed_exercises.length;

    if (completedCount >= totalExercises) {
        // All exercises are done, mark the session as completed
        const { error: completeError } = await supabase
            .from('workout_sessions')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', sessionId);
        
        if (completeError) {
            console.error("Error finalizing session:", completeError);
            return { error: 'Erro ao finalizar a sessão.' };
        }
    } else {
         // If a user un-checks an exercise, we should nullify completed_at
         const { error: uncompleteError } = await supabase
            .from('workout_sessions')
            .update({ completed_at: null })
            .eq('id', sessionId);
        
        if (uncompleteError) {
             console.error("Error un-finalizing session:", uncompleteError);
             return { error: 'Erro ao reabrir a sessão.' };
        }
    }

    revalidatePath(`/public/workout/${session.workout_id}`);
    revalidatePath(`/app/students/${session.workout_id}`);
    return { error: null };
}
