
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Workout } from "@/lib/definitions";
import PublicWorkoutView from "@/components/workouts/public-workout-view";

async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select(
            '*, students(id, name)'
        )
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        notFound();
    }
    return data as Workout;
}

export default async function WorkoutPortalPage({ params }: { params: { id: string }}) {
    const workout = await getWorkoutDetails(params.id);
    return <PublicWorkoutView workout={workout} />;
}
