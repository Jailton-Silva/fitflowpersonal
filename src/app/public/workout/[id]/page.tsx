

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PublicWorkoutView } from "@/components/workouts/public-workout-view";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { Workout } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeOff } from "lucide-react";


async function getWorkout(workoutId: string): Promise<Workout | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("workouts")
        .select("*, students(id, name)")
        .eq("id", workoutId)
        .single();
    
    if (error) {
        console.error("Error fetching workout:", error);
        return null;
    }
    return data as Workout;
}


export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const workout = await getWorkout(params.id);

    if (!workout) {
        notFound();
    }
    
    // Check if workout is active
    if (workout.status === 'inactive') {
        return (
             <div className="flex items-center justify-center min-h-screen bg-muted">
                <Card className="mx-auto max-w-sm w-full text-center">
                     <CardHeader>
                        <EyeOff className="mx-auto h-8 w-8 text-muted-foreground" />
                        <CardTitle className="text-2xl font-headline mt-4">Treino Indisponível</CardTitle>
                        <CardDescription>
                            Este plano de treino não está ativo no momento. Por favor, entre em contato com seu personal trainer.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // If workout has no password, it's public
    if (!workout.access_password) {
        return <PublicWorkoutView workout={workout} />;
    }

    // If it has a password, check for auth cookie
    const isAuthorized = cookieStore.has(`workout_auth_${params.id}`);

    if (isAuthorized) {
        return <PublicWorkoutView workout={workout} />;
    }

    return <WorkoutPasswordForm workoutId={params.id} />;
}
