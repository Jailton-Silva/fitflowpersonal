import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";

async function getWorkout(workoutId: string) {
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
    return data;
}

export default async function PublicWorkoutPasswordPage({ params }: { params: { id: string } }) {
    const workout = await getWorkout(params.id);
    const cookieStore = cookies();
    const isAuthorized = cookieStore.get(`workout_auth_${workout.id}`)?.value === 'true';

    // Se o treino não tiver senha ou se o usuário já estiver autorizado pelo cookie,
    // a middleware já o terá redirecionado para /portal.
    // Esta página só é renderizada se a senha for necessária.
    if (!workout.access_password) {
        // Se não há senha, idealmente o middleware deveria redirecionar, mas como fallback:
        notFound();
    }
    
    return <WorkoutPasswordForm workoutId={workout.id} />;
}
