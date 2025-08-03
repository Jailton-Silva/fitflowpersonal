import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { Workout } from "@/lib/definitions";
import PublicWorkoutView from "@/components/workouts/public-workout-view";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";

async function getWorkout(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name, avatar_url)')
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        console.error("Workout not found:", error);
        notFound();
    }
    return data as Workout;
}

export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const workout = await getWorkout(params.id);

    // If workout is inactive, no one can see it
    if (workout.status === 'inactive') {
        return (
             <div className="flex items-center justify-center min-h-screen bg-muted text-center p-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Treino Indisponível</h1>
                    <p className="text-muted-foreground mt-2">Este plano de treino não está ativo no momento. Fale com seu personal trainer.</p>
                </div>
            </div>
        )
    }

    // If workout has no password, it's public
    if (!workout.access_password) {
        return <PublicWorkoutView workout={workout} />;
    }

    // Workout has a password, check for auth cookie
    const hasAuthCookie = cookieStore.has(`workout_auth_${workout.id}`);

    if (hasAuthCookie) {
        return <PublicWorkoutView workout={workout} />;
    } else {
        return <WorkoutPasswordForm workoutId={workout.id} />;
    }
}
