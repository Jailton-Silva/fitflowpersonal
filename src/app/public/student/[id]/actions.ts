
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyStudentPassword(prevState: any, formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;
  
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
    return { error: "Aluno não encontrado." };
  }

  if (student.access_password === password) {
    cookies().set(`student_auth_${studentId}`, "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    // Redirect to the same page, the page logic will handle showing the content
    redirect(`/public/student/${studentId}`);
  } else {
    return { error: "Senha incorreta. Tente novamente." };
  }
}
