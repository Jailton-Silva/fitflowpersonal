
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function verifyStudentPassword(previousState: any, formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;
  const cookieStore = cookies();

  if (!studentId || !password) {
    return { error: "ID do aluno e senha são obrigatórios." };
  }

  const supabase = createClient();
  const { data: student, error } = await supabase
    .from("students")
    .select("access_password")
    .eq("id", studentId)
    .single();

  if (error || !student) {
    return { error: "Aluno não encontrado ou erro no servidor." };
  }

  // Handle case where password is not set (public access)
  if (!student.access_password) {
     cookieStore.set(`student-${studentId}-auth`, "true", { path: "/", httpOnly: true, sameSite: "strict" });
     redirect(`/public/student/${studentId}/portal`);
  }

  if (student.access_password !== password) {
    return { error: "Senha incorreta." };
  }

  cookieStore.set(`student-${studentId}-auth`, "true", { path: "/", httpOnly: true, sameSite: "strict" });
  redirect(`/public/student/${studentId}/portal`);
}


export async function logoutStudent(studentId: string) {
    const cookieStore = cookies();
    cookieStore.delete(`student-${studentId}-auth`);
    redirect(`/public/student/${studentId}`);
}


export async function uploadStudentAvatar(studentId: string, formData: FormData) {
    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) {
        return { error: 'Nenhum arquivo enviado.' };
    }
    
    const supabase = createClient();
    const filePath = `${studentId}/${file.name}-${new Date().getTime()}`;

    // 1. Upload to storage (this is public, so it should work)
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true,
        });

    if (uploadError) {
        console.error('Student Upload Error:', uploadError);
        return { error: `Erro no upload: ${uploadError.message}` };
    }

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // 3. Use admin client to update the students table, bypassing RLS
    const { error: updateError } = await supabaseAdmin
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', studentId);
        
    if (updateError) {
        console.error('Student DB Update Error:', updateError);
        // Clean up storage if DB update fails
        await supabase.storage.from('avatars').remove([filePath]);
        return { error: `Erro ao atualizar o perfil: ${updateError.message}` };
    }
    
    revalidatePath(`/public/student/${studentId}/portal`);
    return { error: null, path: publicUrl };
}
