
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

  // Use the standard client for storage upload, respecting storage policies (public bucket)
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
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath);

  // Use the admin client to bypass RLS for updating the student's avatar URL
  // THIS IS THE CRITICAL FIX: Use supabaseAdmin here
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
  revalidatePath(`/students/${studentId}`);
  return { error: null, path: publicUrl };
}


export async function verifyStudentPassword(
  prevState: { error: string | null },
  formData: FormData
) {
  const password = formData.get('password') as string;
  const studentId = formData.get('studentId') as string;

  if (!password || !studentId) {
    return { error: 'ID do aluno ou senha não fornecidos.' };
  }

  const { data: student, error } = await supabaseAdmin
    .from('students')
    .select('access_password')
    .eq('id', studentId)
    .single();

  if (error || !student) {
    return { error: 'Aluno não encontrado.' };
  }

  if (student.access_password !== password) {
    return { error: 'Senha incorreta.' };
  }

  // Set auth cookie
  cookies().set(`student-${studentId}-auth`, 'true', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect(`/public/student/${studentId}/portal`);
}

export async function logoutStudent(studentId: string) {
    cookies().delete(`student-${studentId}-auth`);
}
