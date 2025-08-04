
'use server'

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    return { error: 'Aluno não encontrado.' };
  }
  
  if (student.access_password === password) {
    // Set a cookie to remember the authenticated state
    cookies().set(`student-${studentId}-auth`, 'true', { path: '/', maxAge: 60 * 60 * 24 * 7 }); // Cookie expires in 7 days
  } else {
    return { error: 'Senha incorreta. Por favor, tente novamente.' };
  }

  // Redirect to the student portal on success
  redirect(`/public/student/${studentId}/portal`);
}

export async function logoutStudent(studentId: string) {
    cookies().delete(`student-${studentId}-auth`);
}

