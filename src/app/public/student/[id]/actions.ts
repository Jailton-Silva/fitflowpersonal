
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function verifyStudentPassword(prevState: any, formData: FormData) {
    const studentId = formData.get('studentId') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();
    const cookieStore = cookies();

    const { data, error } = await supabase
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();
    
    if (error || !data) {
        return { error: 'Aluno não encontrado ou erro no servidor.', success: false };
    }
    
    // For simplicity, we'll store a plain text password.
    // In a real app, you MUST hash the password.
    if (data.access_password && data.access_password === password) {
        cookieStore.set(`student_auth_${studentId}`, 'true', {
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        return { error: null, success: true };
    } else {
        return { error: 'Senha incorreta. Por favor, tente novamente.', success: false };
    }
}
