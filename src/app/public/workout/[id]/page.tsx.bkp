
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import PublicWorkoutView from "@/components/workouts/public-workout-view";
import { Workout } from "@/lib/definitions";

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
    return data as Workout;
}

export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const workout = await getWorkout(params.id);
    const cookieStore = cookies();
    
    // Check if the associated student requires auth and if user is authenticated
    if (workout.student_id) {
         const { data: student } = await createClient().from('students').select('access_password').eq('id', workout.student_id).single();
         const isStudentAuthenticated = cookieStore.get(`student-${workout.student_id}-auth`)?.value === "true";
         if(student?.access_password && !isStudentAuthenticated) {
            // This case should ideally be handled by middleware redirecting to student login
            // But as a fallback, we can show a message or redirect.
            return notFound(); 
         }
    }
    
    // Check for workout-specific password
    const isWorkoutAuthenticated = cookieStore.get(`workout-${workout.id}-auth`)?.value === 'true';

    if (workout.access_password && !isWorkoutAuthenticated) {
        return <WorkoutPasswordForm workoutId={workout.id} />;
    }

    return <PublicWorkoutView workout={workout} />;
}
