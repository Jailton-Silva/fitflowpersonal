
'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function uploadStudentAvatar(studentId: string, formData: FormData) {
    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) {
        return { error: 'Nenhum arquivo enviado.' };
    }
    
    // Use the standard client for storage upload
    const supabase = createClient();
    const filePath = `${studentId}/${file.name}-${new Date().getTime()}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true,
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return { error: `Erro no upload: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Use the ADMIN client to bypass RLS for updating the student's avatar URL
    const { error: updateError } = await supabaseAdmin
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', studentId);
        
    if (updateError) {
        console.error('Update Error:', updateError);
        // Attempt to remove the uploaded file if the DB update fails
        await supabase.storage.from('avatars').remove([filePath]);
        return { error: `Erro ao atualizar perfil: ${updateError.message}` };
    }
    
    revalidatePath(`/public/student/${studentId}/portal`);
    return { error: null, path: publicUrl };
}


export async function logoutStudent(studentId: string) {
    const cookieStore = cookies();
    cookieStore.delete(`student-${studentId}-auth`);
    redirect(`/public/student/${studentId}`);
}

export async function verifyStudentPassword(previousState: any, formData: FormData) {
    const supabase = createClient();
    const password = formData.get('password') as string;
    const studentId = formData.get('studentId') as string;

    const { data: student, error } = await supabase
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        return { error: 'Aluno não encontrado ou erro no servidor.' };
    }

    if (!student.access_password) {
         return { error: 'Este aluno não tem uma senha de acesso configurada.' };
    }

    if (student.access_password !== password) {
        return { error: 'Senha incorreta.' };
    }
    
    // Set cookie and redirect
    const cookieStore = cookies();
    cookieStore.set(`student-${studentId}-auth`, 'true', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    redirect(`/public/student/${studentId}/portal`);
}
