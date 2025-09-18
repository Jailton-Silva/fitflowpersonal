
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const LoginSchema = z.object({
    studentId: z.string(),
    password: z.string(),
});

export async function authenticateStudent(formData: FormData) {
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = LoginSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return { error: "Dados inválidos." };
    }

    const { studentId, password } = validatedFields.data;

    const supabase = createClient();
    
    // Busca o aluno e sua senha de acesso no banco de dados.
    const { data: student, error } = await supabase
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        return { error: "Ocorreu um erro ao verificar suas credenciais. Tente novamente." };
    }

    // Compara a senha enviada com a senha armazenada no banco.
    if (student.access_password === password) {
        // Se a senha estiver correta, cria um cookie de autenticação.
        // Este cookie é seguro e sinaliza que o aluno está logado no seu portal.
        cookies().set(`student-${studentId}-auth`, "true", {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // Expira em 7 dias
        });
        return { success: true };
    } else {
        // Se a senha estiver incorreta, retorna um erro.
        return { error: "A senha fornecida está incorreta." };
    }
}
