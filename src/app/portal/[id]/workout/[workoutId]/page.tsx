
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Student, Workout } from "@/lib/definitions";
import WorkoutClientPage from "./client-page";
import { cookies } from "next/headers";

async function getWorkoutPortalData(studentId: string, workoutId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // A busca do aluno não precisa mais da senha
    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, name, avatar_url, status')
        .eq('id', studentId)
        .single();

    if (studentError || !student || student.status !== 'active') {
        if(studentError) console.error("Portal/Workout: Aluno não encontrado - ", studentError.message);
        notFound();
    }

    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('*, students(id, name, avatar_url)')
        .eq('id', workoutId)
        .eq('student_id', studentId)
        .single();

    if (workoutError || !workout) {
        if(workoutError) console.error("Portal/Workout: Treino não encontrado - ", workoutError.message);
        notFound();
    }

    return {
        student: student as Student,
        workout: workout as Workout,
    };
}

export default async function StudentWorkoutPortalPage({ params }: { params: { id: string, workoutId: string } }) {
    const cookieStore = cookies();
    
    if (!params.id || !params.workoutId) {
        notFound();
    }

    // LÓGICA DE SESSÃO: Garante que apenas usuários logados acessem esta página.
    const sessionCookie = cookieStore.get(`portal-session-${params.id}`);
    if (!sessionCookie) {
        redirect('/portal');
    }

    const { student, workout } = await getWorkoutPortalData(params.id, params.workoutId);

    // Passa os dados para o componente de cliente, que agora é apenas de exibição.
    return <WorkoutClientPage student={student} workout={workout} />;
}
