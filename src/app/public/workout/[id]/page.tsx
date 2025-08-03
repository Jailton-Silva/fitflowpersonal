
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import PublicWorkoutView from "@/components/workouts/public-workout-view";
import { Workout } from "@/lib/definitions";

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


export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const workout = await getWorkoutDetails(params.id);

    // If workout has no password, show it directly
    if (!workout.access_password) {
        return <PublicWorkoutView workout={workout} />;
    }

    // Check for auth cookie
    const cookieStore = cookies();
    const authCookie = cookieStore.get(`workout_auth_${params.id}`);

    if (authCookie?.value === 'true') {
        return <PublicWorkoutView workout={workout} />;
    }

    // If it has a password and user is not authenticated, show password form
    return <WorkoutPasswordForm workoutId={params.id} />;
}
