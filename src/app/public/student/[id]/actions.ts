
'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    return { error: 'Aluno não encontrado ou erro no servidor.' };
  }

  if (student.access_password && student.access_password === password) {
    cookies().set(`student-${studentId}-auth`, 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    });
    revalidatePath(`/public/student/${studentId}`);
    redirect(`/public/student/${studentId}/portal`);
  } else if (!student.access_password) {
    // Acesso livre se não houver senha
    cookies().set(`student-${studentId}-auth`, 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    });
    revalidatePath(`/public/student/${studentId}`);
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

  // Use o cliente padrão para upload no storage, pois o bucket é público
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

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath);

  // Use o cliente ADMIN para atualizar o banco de dados, ignorando o RLS
  const { error: updateError } = await supabaseAdmin
    .from('students')
    .update({ avatar_url: publicUrl })
    .eq('id', studentId);

  if (updateError) {
    console.error('Update Error:', updateError);
    await supabase.storage.from('avatars').remove([filePath]);
    return { error: `Erro ao atualizar perfil: ${updateError.message}` };
  }

  revalidatePath(`/public/student/${studentId}/portal`);
  revalidatePath(`/students/${studentId}`); // Invalida a página do trainer também
  return { error: null, path: publicUrl };
}

export async function logoutStudent(studentId: string) {
  cookies().delete(`student-${studentId}-auth`);
  redirect(`/public/student/${studentId}`);
}
