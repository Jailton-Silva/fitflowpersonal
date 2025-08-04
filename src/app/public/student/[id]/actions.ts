
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyStudentPassword(prevState: any, formData: FormData) {
    const supabase = createClient();
    const password = formData.get('password') as string;
    const studentId = formData.get('studentId') as string;

    if (!password || !studentId) {
        return { error: 'Dados inválidos.' };
    }

    const { data: student, error } = await supabase
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();
    
    if (error || !student) {
        return { error: 'Aluno não encontrado.' };
    }

    if (student.access_password === password) {
        cookies().set(`student-${studentId}-auth`, 'true', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        redirect(`/public/student/${studentId}/portal`);
    } else {
        return { error: 'Senha incorreta.' };
    }
}


export async function uploadStudentAvatar(studentId: string, formData: FormData) {
    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) {
        return { error: 'Nenhum arquivo enviado.' };
    }
    
    const supabase = createClient();
    const filePath = `${studentId}/${file.name}-${new Date().getTime()}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true, // Overwrite if file exists
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return { error: `Erro no upload: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Update students table
    const { error: updateError } = await supabase
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', studentId);
        
    if (updateError) {
        console.error('Update Error:', updateError);
        return { error: `Erro ao atualizar perfil: ${updateError.message}` };
    }
    
    revalidatePath(`/public/student/${studentId}/portal`);
    return { error: null, path: publicUrl };
}


export async function logoutStudent(studentId: string) {
    cookies().set(`student-${studentId}-auth`, "false", { path: "/", maxAge: -1 });
    redirect(`/public/student/${studentId}`);
}

