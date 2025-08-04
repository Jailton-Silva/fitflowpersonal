
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function verifyStudentPassword(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const studentId = formData.get("studentId") as string;

  if (!password || !studentId) {
    return { error: "Dados inválidos." };
  }

  const supabase = createClient();
  const { data: student, error } = await supabase
    .from("students")
    .select("access_password")
    .eq("id", studentId)
    .single();

  if (error || !student) {
    return { error: "Aluno não encontrado." };
  }
  
  if (!student.access_password) {
      // No password set, allow access
      const cookieStore = cookies();
      cookieStore.set(`student-${studentId}-auth`, "true", { path: "/", httpOnly: true });
      return { success: true, error: null };
  }

  if (student.access_password !== password) {
    return { error: "Senha incorreta." };
  }

  // Set auth cookie
  const cookieStore = cookies();
  cookieStore.set(`student-${studentId}-auth`, "true", { path: "/", httpOnly: true });

  return { success: true, error: null };
}

export async function uploadStudentAvatar(studentId: string, formData: FormData) {
    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) {
        return { error: 'Nenhum arquivo enviado.' };
    }
    
    const supabase = createClient();
    const filePath = `${studentId}/${file.name}-${Date.now()}`;

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

    // Update students table
    const { error: updateError } = await supabase
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', studentId);
        
    if (updateError) {
        console.error('Update Error:', updateError);
        await supabase.storage.from('avatars').remove([filePath]);
        return { error: `Erro ao atualizar perfil: ${updateError.message}` };
    }
    
    revalidatePath(`/public/student/${studentId}/portal`);
    return { error: null, path: publicUrl };
}
