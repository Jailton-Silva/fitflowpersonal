
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PortalClientPage from "./client-page";
import { Student, Workout } from "@/lib/definitions";
import { cookies } from "next/headers";

// Esta função busca os dados no servidor usando a SERVICE_ROLE para bypassar RLS,
// que é necessário para uma página pública como o portal.
async function getPortalData(studentId: string) {
    const cookieStore = cookies();
    // IMPORTANTE: Criamos um Supabase Admin Client para ler os dados do aluno sem depender de um usuário logado.
    const supabase = createClient(cookieStore, { isAdmin: true });

    // 1. Busca os dados do aluno pelo ID
    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, name, avatar_url, status, access_password') // Seleciona apenas os campos necessários
        .eq('id', studentId)
        .single();

    // Se o aluno não for encontrado ou estiver inativo, retorna 404.
    if (studentError || !student || student.status !== 'active') {
        if (studentError) console.error("Portal Error (Student Fetch):", studentError.message);
        notFound();
    }

    // 2. Busca os treinos ativos (ou não iniciados) associados a esse aluno
    const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('student_id', studentId)
        .in('status', ['active', 'not-started'])
        .order('created_at', { ascending: false });
    
    if (workoutsError) {
        console.error("Portal Error (Workouts Fetch):", workoutsError.message);
        // Não retorna notFound() para que o portal carregue mesmo sem treinos
    }

    return {
        student: student as Student,
        workouts: (workouts as Workout[]) || [],
    };
}

export default async function StudentPortalPage({ params }: { params: { id: string } }) {
    
    if (!params.id) {
        notFound();
    }

    const { student, workouts } = await getPortalData(params.id);

    // Passamos o objeto do aluno (incluindo o hash da senha, se houver) e os treinos para o Client Component
    return <PortalClientPage student={student} initialWorkouts={workouts} />;
}
