
"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyStudentPassword(
  prevState: { error: string | null },
  formData: FormData
) {
  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;

  if (!studentId || !password) {
    return { error: "ID do aluno ou senha não fornecidos." };
  }

  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("access_password")
    .eq("id", studentId)
    .single();

  if (error || !student) {
    return { error: "Aluno não encontrado." };
  }

  if (student.access_password && student.access_password === password) {
    cookies().set(`student-${studentId}-auth`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
    redirect(`/public/student/${studentId}/portal`);
  } else {
    return { error: "Senha inválida." };
  }
}

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
    
    redirect(`/public/student/${studentId}/portal`);
}

export async function logoutStudent(studentId: string) {
    cookies().set(`student-${studentId}-auth`, 'false', {
        httpOnly: true,
        path: '/',
        expires: new Date(0), // Expire the cookie
    });
    // The client-side will handle the redirect
    return { success: true };
}
