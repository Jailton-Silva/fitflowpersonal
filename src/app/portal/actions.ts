
"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { finish } from "node:stream";

interface LoginResponse {
    success: boolean;
    studentId?: string;
    error?: string;
}

export async function portalLogin(email: string, password: string): Promise<LoginResponse> {
    noStore();
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    if (!email || !password) {
        return { success: false, error: "E-mail e senha são obrigatórios." };
    }

    const { data: student, error } = await supabase
        .from('students')
        .select('id, status, access_password')
        .eq('email', email)
        .single();

    if (error || !student) {
        console.error("Portal Login Error:", error?.message);
        return { success: false, error: "Credenciais inválidas." };
    }

    if (student.status !== 'active') {
        return { success: false, error: "Esta conta não está ativa. Fale com seu instrutor." };
    }

    const isPasswordMatch = student.access_password === password;

    if (!isPasswordMatch) {
        return { success: false, error: "Credenciais inválidas." };
    }

    const sessionToken = `${student.id}::${Date.now()}`;
    cookieStore.set(`portal-session-${student.id}`, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 dia
    });

    return { success: true, studentId: student.id };
}

// --- FUNÇÃO PARA ATUALIZAR PERFIL ---

interface UpdateProfileResponse {
    success: boolean;
    error?: string;
}

export async function updateStudentProfile(
    studentId: string,
    data: { phone?: string; }
): Promise<UpdateProfileResponse> {
    noStore();
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const sessionCookie = cookieStore.get(`portal-session-${studentId}`);
    if (!sessionCookie) {
        return { success: false, error: "Acesso não autorizado." };
    }

    if (!studentId || !data) {
        return { success: false, error: "Dados inválidos para atualização." };
    }

    const { error } = await supabase
        .from('students')
        .update(data)
        .eq('id', studentId);

    if (error) {
        console.error("Update Profile Error:", error.message);
        return { success: false, error: "Não foi possível salvar as alterações." };
    }

    revalidatePath(`/portal/${studentId}`);

    return { success: true };
}

// --- FUNÇÃO PARA FINALIZAR TREINO ---

interface FinishWorkoutResponse {
    error?: string;
}

export async function finishWorkoutSession(sessionId: string): Promise<FinishWorkoutResponse> {
    noStore();
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('student_id')
        .eq('id', sessionId)
        .single();
    
    if (sessionError || !session) {
        return { error: 'Sessão de treino não encontrada.' };
    }

    const sessionCookie = cookieStore.get(`portal-session-${session.student_id}`);
    if (!sessionCookie) {
        return { error: "Acesso não autorizado." };
    }

    const { error } = await supabase
        .from('workout_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId);

    if (error) {
        return { error: "Não foi possível finalizar o treino. " + error.message };
    }

    revalidatePath(`/portal/${session.student_id}`);
    
    return {};
}

// --- FUNÇÃO PARA ATUALIZAR EXERCÍCIOS COMPLETOS ---

export async function updateCompletedExercises(sessionId: string, exerciseId: string, isCompleted: boolean) {
    noStore();
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: session, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('completed_exercises, student_id')
        .eq('id', sessionId)
        .single();
    
    if (fetchError || !session) {
        return { error: 'Sessão de treino não encontrada.' };
    }

    const sessionCookie = cookieStore.get(`portal-session-${session.student_id}`);
    if (!sessionCookie) {
        return { error: "Acesso não autorizado." };
    }

    const currentCompleted = session.completed_exercises || [];

    let updatedCompleted: string[];
    if (isCompleted) {
        updatedCompleted = [...new Set([...currentCompleted, exerciseId])];
    } else {
        updatedCompleted = currentCompleted.filter(id => id !== exerciseId);
    }
    
    const { error } = await supabase
        .from('workout_sessions')
        .update({ completed_exercises: updatedCompleted })
        .eq('id', sessionId);
    
    if (error) {
        return { error: "Não foi possível atualizar o exercício. " + error.message };
    }

    revalidatePath(`/portal/${session.student_id}`);

    return { };
}
