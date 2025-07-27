
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Workout } from "@/lib/definitions";
import PublicWorkoutView from "@/components/workouts/public-workout-view";

async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name)')
        .eq('id', workoutId)
        .single();
    
    if (error) {
        console.error("Error fetching workout:", error);
        return null;
    }
    return data as Workout;
}

export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const workoutId = params.id;
    
    const workout = await getWorkoutDetails(workoutId);

    if (!workout) {
        notFound();
    }

    // Se não há senha, o acesso é livre
    if (!workout.access_password) {
        return <PublicWorkoutView workout={workout} initialIsAuthorized={true} />;
    }

    // Se há senha, verifica o cookie de autorização
    const authToken = cookieStore.get(`workout_auth_${workoutId}`)?.value;
    const isAuthorized = authToken === workout.access_password;

    if (!isAuthorized) {
        return <PublicWorkoutView workout={workout} initialIsAuthorized={false} />;
    }
    
    return <PublicWorkoutView workout={workout} initialIsAuthorized={true} />;
}
