import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
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

export default async function WorkoutPortalPage({ params }: { params: { id: string } }) {
    const workout = await getWorkoutDetails(params.id);
    const cookieStore = cookies();
    const isAuthorized = cookieStore.get(`workout_auth_${workout.id}`)?.value === 'true';

    // Se o treino tem senha E o usuário não está autorizado, redireciona para a página de senha
    if (workout.access_password && !isAuthorized) {
        redirect(`/public/workout/${workout.id}`);
    }

    return <PublicWorkoutView workout={workout} initialIsAuthorized={isAuthorized} />;
}
