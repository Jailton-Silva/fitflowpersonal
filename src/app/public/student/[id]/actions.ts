
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyStudentPassword(
  prevState: { error: string | null },
  formData: FormData
) {
  const password = formData.get("password") as string;
  const studentId = formData.get("studentId") as string;
  
  if (!password || !studentId) {
    return { error: "Formulário inválido." };
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
     return { error: "Este portal não requer senha." };
  }

  if (student.access_password !== password) {
    return { error: "Senha incorreta. Tente novamente." };
  }

  // Set cookie and redirect
  cookies().set(`student-${studentId}-auth`, "true", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
  });

  redirect(`/public/student/${studentId}/portal`);
}
