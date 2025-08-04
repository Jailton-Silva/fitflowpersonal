
"use server";

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
    
    // Use the standard client for storage upload, respecting storage policies
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

    // Use the admin client to bypass RLS for updating the student's avatar URL
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
    revalidatePath(`/public/student/${studentId}`);
}


export async function verifyStudentPassword(prevState: any, formData: FormData) {
    const password = formData.get('password') as string;
    const studentId = formData.get('studentId') as string;
    
    const supabase = createClient();
    
    const { data: student, error } = await supabase
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();
        
    if (error || !student) {
        return { error: 'Aluno não encontrado ou erro ao buscar dados.' };
    }

    // If password is null or empty, access is granted
    if (!student.access_password) {
        cookies().set(`student-${studentId}-auth`, 'true', { httpOnly: true, path: '/' });
        redirect(`/public/student/${studentId}/portal`);
    }

    if (student.access_password === password) {
        cookies().set(`student-${studentId}-auth`, 'true', { httpOnly: true, path: '/' });
        redirect(`/public/student/${studentId}/portal`);
    } else {
        return { error: 'Senha incorreta. Por favor, tente novamente.' };
    }
}
