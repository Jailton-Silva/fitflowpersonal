
'use server';

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function uploadStudentAvatar(studentId: string, formData: FormData) {
    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) {
        return { error: 'Nenhum arquivo enviado.' };
    }
    
    // Use the standard client for storage upload, which is fine for public buckets
    const supabase = createClient();
    const filePath = `${studentId}/${file.name}-${new Date().getTime()}`;

    // 1. Upload to storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true,
        });

    if (uploadError) {
        console.error('Storage Upload Error:', uploadError);
        return { error: `Erro no upload: ${uploadError.message}` };
    }

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // 3. Use the admin client to bypass RLS for the database update
    const { error: updateError } = await supabaseAdmin
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', studentId);
        
    if (updateError) {
        console.error('DB Update Error:', updateError);
        // Attempt to remove the uploaded file if the DB update fails
        await supabase.storage.from('avatars').remove([filePath]);
        return { error: `Erro ao atualizar o banco de dados: ${updateError.message}` };
    }
    
    // 4. Revalidate paths
    revalidatePath(`/public/student/${studentId}/portal`);
    revalidatePath(`/students/${studentId}`);
    return { error: null, path: publicUrl };
}


export async function verifyStudentPassword(previousState: any, formData: FormData) {
    const studentId = formData.get('studentId') as string;
    const password = formData.get('password') as string;
    
    if (!studentId || !password) {
        return { error: 'ID do aluno e senha são obrigatórios.' };
    }

    const { data: student, error } = await supabaseAdmin
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

export async function logoutStudent(studentId: string) {
    cookies().set(`student-${studentId}-auth`, '', {
        path: '/',
        expires: new Date(0),
    });
}
