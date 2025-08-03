
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function verifyStudentPassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  const studentId = formData.get('studentId') as string;

  if (!password || !studentId) {
    return { error: 'ID do aluno e senha são necessários.', success: false };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('access_password')
    .eq('id', studentId)
    .single();

  if (error || !data) {
    return { error: 'Aluno não encontrado.', success: false };
  }

  if (data.access_password === password) {
    cookies().set(`student_auth_${studentId}`, 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return { error: null, success: true };
  } else {
    return { error: 'Senha incorreta.', success: false };
  }
}
