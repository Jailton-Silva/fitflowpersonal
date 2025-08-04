import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import PublicWorkoutView from "@/components/workouts/public-workout-view";
import { Workout } from "@/lib/definitions";

async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name)')
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        notFound();
    }
    
    // Check workout status for public access
    if (data.status === 'inactive') {
        notFound();
    }

    return data as Workout;
}


export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const workout = await getWorkoutDetails(params.id);
    const cookieStore = cookies();
    const isAuthenticated = cookieStore.get(`workout-${params.id}-auth`)?.value === "true";

    // If workout has a password and user is not authenticated, show password form
    if (workout.access_password && !isAuthenticated) {
        return <WorkoutPasswordForm workoutId={params.id} />
    }
    
    // Otherwise, show the workout
    return <PublicWorkoutView workout={workout} />;
}
