
"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function verifyStudentPassword(previousState: any, formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;
  const cookieStore = cookies();

  if (!studentId || !password) {
    return { error: "ID do aluno e senha são obrigatórios." };
  }

  // Use admin client to bypass RLS for password check
  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("access_password")
    .eq("id", studentId)
    .single();

  if (error || !student) {
    return { error: "Aluno não encontrado." };
  }

  if (student.access_password === password) {
    // Password is correct, set a cookie
    cookieStore.set(`student-${studentId}-auth`, "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    revalidatePath(`/public/student/${studentId}/portal`);
    redirect(`/public/student/${studentId}/portal`);
  } else {
    // Password is incorrect
    return { error: "Senha inválida." };
  }
}
