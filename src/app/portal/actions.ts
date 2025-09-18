
"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { cookies } from "next/headers";

interface LoginResponse {
    success: boolean;
    studentId?: string;
    error?: string;
}

export async function portalLogin(email: string, password: string): Promise<LoginResponse> {
    noStore();
    const cookieStore = cookies();
    const supabase = await createClient();

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

// --- NOVA FUNÇÃO ---

interface UpdateProfileResponse {
    success: boolean;
    error?: string;
}

/**
 * Atualiza as informações de perfil de um aluno.
 * @param studentId O ID do aluno a ser atualizado.
 * @param data Os dados a serem atualizados (telefone, tema).
 * @returns Um objeto indicando sucesso ou falha na operação.
 */
export async function updateStudentProfile(
    studentId: string,
    data: { phone?: string; }
): Promise<UpdateProfileResponse> {
    noStore();
    const cookieStore = cookies();
    const supabase = await createClient();

    // 1. Verifica se o usuário está autenticado para esta ação
    const sessionCookie = cookieStore.get(`portal-session-${studentId}`);
    if (!sessionCookie) {
        return { success: false, error: "Acesso não autorizado." };
    }

    if (!studentId || !data) {
        return { success: false, error: "Dados inválidos para atualização." };
    }

    // 2. Atualiza os dados no Supabase
    const { error } = await supabase
        .from('students')
        .update(data)
        .eq('id', studentId);

    if (error) {
        console.error("Update Profile Error:", error.message);
        return { success: false, error: "Não foi possível salvar as alterações." };
    }

    // 3. Revalida o caminho para garantir que a página seja renderizada novamente com os dados atualizados
    revalidatePath(`/portal/${studentId}`);

    return { success: true };
}
