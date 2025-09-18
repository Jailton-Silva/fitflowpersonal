
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";

const StudentFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "O nome do aluno é obrigatório."),
  email: z.string().email("Formato de email inválido."),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  goals: z.string().optional(),
  medical_conditions: z.string().optional(),
});

export async function saveStudent(formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const rawFormData = Object.fromEntries(formData.entries());

    const validatedFields = StudentFormSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { id, ...studentData } = validatedFields.data;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {  throw new Error("Usuário não autenticado"); }

    const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!trainer) { throw new Error("Personal não encontrado"); }

    let error;
    if (id) {
        // Update
        const { error: updateError } = await supabase.from('students').update(studentData).eq('id', id);
        error = updateError;
    } else {
        // Create
        const { error: insertError } = await supabase.from('students').insert([{ ...studentData, trainer_id: trainer.id }]);
        error = insertError;
    }

    if (error) {
        console.error("Erro ao salvar aluno:", error);
        throw new Error(`Ocorreu um erro ao salvar o aluno: ${error.message}`);
    }

    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
}

const AccessPasswordSchema = z.object({
  studentId: z.string(),
  access_password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres.").or(z.literal('')),
});

export async function updateStudentAccessPassword(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = AccessPasswordSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Houve um erro de validação."
    };
  }

  const { studentId, access_password } = validatedFields.data;

  const { error } = await supabase
    .from('students')
    .update({ access_password: access_password || null })
    .eq('id', studentId);

  if (error) {
    console.error("Erro ao atualizar senha de acesso do aluno:", error);
    return {
      message: `Erro no banco de dados: ${error.message}`
    }
  }

  revalidatePath(`/students/${studentId}`);
  
  return {
    message: "Senha de acesso atualizada com sucesso!"
  }
}
