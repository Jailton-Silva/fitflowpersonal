"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CreateTrainer {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export const createTrainerAction = async ({
  name,
  email,
  password,
  phone
}: CreateTrainer): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    // 1. Criar usuário na autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      return {
        success: false,
        message: "Erro ao criar conta de usuário: " + authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Não foi possível criar o usuário.",
      };
    }

    const { error: profileError } = await supabase
      .from("trainers")
      .insert([
        {
          user_id: authData.user.id,
          name,
          email,
          phone: phone || null,
          plan: "Free",
          billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          status: "active",
          role: "trainer",
        },
      ]);

    if (profileError) {
      // Se falhar ao criar o perfil, tentar deletar o usuário criado
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        message: "Erro ao criar perfil do treinador: " + profileError.message,
      };
    }

    revalidatePath("/trainers");
    
    return {
      success: true,
      message: "Treinador criado com sucesso! Verifique seu e-mail para confirmar a conta.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro inesperado: " + (error as Error).message,
    };
  }
};
