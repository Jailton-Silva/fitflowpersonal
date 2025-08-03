
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Workout } from '@/lib/definitions';
import PublicWorkoutView from '@/components/workouts/public-workout-view';

async function getWorkoutDetails(workoutId: string): Promise<Workout> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name)')
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        console.error("Workout not found or error fetching:", error);
        notFound();
    }
    
    return data as Workout;
}


export default async function PublicWorkoutPortalPage({ params }: { params: { id: string } }) {
    const workout = await getWorkoutDetails(params.id);
    return <PublicWorkoutView workout={workout} />;
}
