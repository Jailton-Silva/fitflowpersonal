
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Student, Workout } from "@/lib/definitions";
import WorkoutClientPage from "./client-page";
import { cookies } from "next/headers";

// Usa o cliente admin para bypassar RLS em uma página pública
async function getWorkoutPortalData(studentId: string, workoutId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore, { isAdmin: true });

    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, name, avatar_url, status, access_password') // Pega a senha do aluno também
        .eq('id', studentId)
        .single();

    if (studentError || !student || student.status !== 'active') {
        if(studentError) console.error("Portal/Workout: Aluno não encontrado - ", studentError.message);
        notFound();
    }

    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
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
    
    if (!params.id || !params.workoutId) {
        notFound();
    }

    const { student, workout } = await getWorkoutPortalData(params.id, params.workoutId);

    return <WorkoutClientPage student={student} workout={workout} />;
}
