
'use server'
 
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
 
export async function verifyPassword(prevState: { error: string | null } | null, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient()
 
  const password = formData.get('password') as string
  const workoutId = formData.get('workoutId') as string
 
  if (!password || !workoutId) {
    return { error: 'Senha e ID do treino são obrigatórios.' }
  }
 
  const { data: workout, error } = await supabase
    .from('workouts')
    .select('access_password')
    .eq('id', workoutId)
    .single()
 
  if (error || !workout) {
    return { error: 'Treino não encontrado ou erro ao buscar.' }
  }
 
  const isCorrectPassword = workout.access_password === password
 
  if (isCorrectPassword) {
    // Store a temporary cookie to grant access
    const cookieName = `workout_access_${workoutId}`
    cookieStore.set(cookieName, 'true', { path: '/', maxAge: 3600 }) // Expires in 1 hour
    redirect(`/public/workout/${workoutId}`)
  } else {
    return { error: 'Senha incorreta. Por favor, tente novamente.' }
  }
}
