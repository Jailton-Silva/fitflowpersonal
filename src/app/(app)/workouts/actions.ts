
"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateWorkoutStatus(workoutId: string, status: 'active' | 'inactive') {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").update({ status }).eq("id", workoutId);
    if (error) {
        return { error };
    }
    revalidatePath("/workouts");
    return { error: null };
}

export async function deleteWorkout(workoutId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
    if (error) {
        return { error };
    }
    revalidatePath("/workouts");
    return { error: null };
}
