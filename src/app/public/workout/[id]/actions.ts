
'use server'
 
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
 
export async function verifyPassword(
  prevState: { error: string | null } | null,
  formData: FormData
) {
  const supabase = createClient()
  const password = formData.get('password') as string
  const workoutId = formData.get('workoutId') as string
 
  if (!password || !workoutId) {
    return { error: 'ID do treino ou senha não fornecidos.' }
  }
 
  const { data: workout, error } = await supabase
    .from('workouts')
    .select('access_password')
    .eq('id', workoutId)
    .single()
 
  if (error || !workout) {
    return { error: 'Treino não encontrado.' }
  }
 
  if (workout.access_password !== password) {
    return { error: 'Senha incorreta.' }
  }
 
  // Set auth cookie if password is correct
  cookies().set(`workout-${workoutId}-auth`, 'true', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
  })
 
  revalidatePath(`/public/workout/${workoutId}`)
  redirect(`/public/workout/${workoutId}`)
}

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    const supabase = createClient();

    // Fetch current completed exercises
    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises')
        .eq('id', sessionId)
        .single();

    if (fetchError) {
        console.error("Fetch Error:", fetchError);
        return { error: "Não foi possível buscar a sessão." };
    }

    let completedExercises: string[] = session.completed_exercises || [];

    if (isCompleted) {
        // Add exerciseId if it's not already there
        if (!completedExercises.includes(exerciseId)) {
            completedExercises.push(exerciseId);
        }
    } else {
        // Remove exerciseId
        completedExercises = completedExercises.filter(id => id !== exerciseId);
    }

    // Update the session
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: completedExercises })
        .eq('id', sessionId);
        
    if (updateError) {
        console.error("Update Error:", updateError);
        return { error: "Não foi possível atualizar a sessão." };
    }

    revalidatePath(`/public/workout/[id]`); // Revalidate the workout page
    return { error: null };
}

export async function finishWorkoutSession(sessionId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('workout_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId);
    
    if (error) {
        console.error("Finish session error:", error);
        return { error: "Não foi possível finalizar a sessão de treino." };
    }

     // Also update the workout status to 'completed'
     const { data: session } = await supabase.from('workout_sessions').select('workout_id').eq('id', sessionId).single();
     if(session?.workout_id){
         await supabase.from('workouts').update({ status: 'completed' }).eq('id', session.workout_id);
     }


    revalidatePath(`/public/workout/[id]`);
    return { error: null };
}
