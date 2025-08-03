
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { WorkoutPasswordForm } from '@/components/workouts/workout-password-form';

export default async function PublicWorkoutPasswordPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const workoutId = params.id;
    const authCookie = cookieStore.get(`workout_auth_${workoutId}`);

    if (authCookie?.value === 'true') {
        return redirect(`/public/workout/${workoutId}/portal`);
    }
    
    // We can verify if the workout exists and requires a password before showing the form
    const supabase = createClient();
    const { data: workout, error } = await supabase
        .from('workouts')
        .select('id, access_password')
        .eq('id', workoutId)
        .single();
    
    if (error || !workout) {
        notFound();
    }
    
    // If workout exists but does not require a password, grant access
    if (workout && !workout.access_password) {
        cookies().set(`workout_auth_${workoutId}`, 'true', { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 });
        return redirect(`/public/workout/${workoutId}/portal`);
    }

    return <WorkoutPasswordForm workoutId={workoutId} />;
}
