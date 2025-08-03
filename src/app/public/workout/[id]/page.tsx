
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";

async function getWorkout(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select('id')
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        notFound();
    }
    return data;
}

export default async function PublicWorkoutPasswordPage({ params }: { params: { id: string } }) {
    await getWorkout(params.id); // Ensure workout exists

    const cookieStore = cookies();
    const authCookie = cookieStore.get(`workout_auth_${params.id}`);

    if (authCookie?.value === 'true') {
        redirect(`/public/workout/${params.id}/portal`);
    }

    return <WorkoutPasswordForm workoutId={params.id} />;
}
