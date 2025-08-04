
"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Action to verify the student's password for portal access
export async function verifyStudentPassword(prevState: any, formData: FormData) {
    const password = formData.get("password") as string;
    const studentId = formData.get("studentId") as string;
    
    if (!password || !studentId) {
        return { error: "ID do aluno ou senha não fornecidos." };
    }

    const { data: student, error } = await supabaseAdmin
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        return { error: "Aluno não encontrado ou erro no servidor." };
    }

    if (student.access_password !== password) {
        return { error: "A senha fornecida está incorreta." };
    }

    // Set cookie on success
    cookies().set(`student-${studentId}-auth`, 'true', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    revalidatePath(`/public/student/${studentId}/portal`);
    redirect(`/public/student/${studentId}/portal`);
}

// Action to log the student out
export async function logoutStudent(studentId: string) {
    cookies().delete(`student-${studentId}-auth`);
    revalidatePath(`/public/student/${studentId}`);
    redirect(`/public/student/${studentId}`);
}

// Action to upload student avatar
export async function uploadStudentAvatar(studentId: string, formData: FormData) {
    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) {
        return { error: 'Nenhum arquivo enviado.' };
    }
    
    // 1. Use the standard client for storage upload respecting public bucket policies
    const supabase = createClient();
    const filePath = `${studentId}/${file.name}-${new Date().getTime()}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true,
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return { error: `Erro no upload: ${uploadError.message}` };
    }

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // 3. Use the ADMIN client to bypass RLS for updating the student's avatar URL
    // This is the crucial step to avoid "violates row-level security policy"
    const { error: updateError } = await supabaseAdmin
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', studentId);
        
    if (updateError) {
        console.error('DB Update Error:', updateError);
        // Attempt to remove the uploaded file if the DB update fails to prevent orphaned files
        await supabase.storage.from('avatars').remove([filePath]);
        return { error: `Erro ao atualizar perfil: ${updateError.message}` };
    }
    
    // Revalidate paths to show the new avatar immediately
    revalidatePath(`/public/student/${studentId}/portal`);
    revalidatePath(`/students/${studentId}`);
    return { error: null, path: publicUrl };
}
