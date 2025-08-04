
"use server";

import { createClient } from "@/lib/supabase/server"; // Corrected import
import { revalidatePath } from "next/cache";

// Fetches the current session and toggles the completed status of an exercise
export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();

    // First, get the current list of completed exercises
    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises, workout_id')
        .eq('id', sessionId)
        .single();

    if (fetchError || !session) {
        console.error("Error fetching session:", fetchError);
        return { error: fetchError?.message || "Session not found" };
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
    
    // Now, update the session with the new list
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: completedExercises })
        .eq('id', sessionId);
    
    if (updateError) {
        console.error("Error updating session:", updateError);
        return { error: updateError.message };
    }
    
    // Check if all exercises are completed to finish the workout
    const { data: workout } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('id', session.workout_id)
        .single();
    
    const allExercises = (workout?.exercises as any[])?.map(e => e.exercise_id) || [];
    const allDone = allExercises.every(id => completedExercises.includes(id));

    if (allDone) {
        await supabase
            .from('workout_sessions')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', sessionId);
    }


    revalidatePath(`/public/workout/${session.workout_id}`);
    return { error: null };
}
