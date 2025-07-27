
"use server"

import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'

export async function verifyStudentPassword(prevState: any, formData: FormData) {
    const supabase = createClient();
    const password = formData.get("password") as string;
    const studentId = formData.get("studentId") as string;

    if (!password || !studentId) {
        return { error: "ID do aluno ou senha não fornecidos." };
    }

    const { data: student, error } = await supabase
        .from("students")
        .select("access_password")
        .eq("id", studentId)
        .single();

    if (error || !student) {
        return { error: "Aluno não encontrado." };
    }

    const isCorrectPassword = student.access_password === password;

    if (!isCorrectPassword) {
        return { error: "Senha incorreta. Tente novamente." };
    }
    
    cookies().set(`student-auth-${studentId}`, "true", {
        path: `/public/student/${studentId}`,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true };
}
