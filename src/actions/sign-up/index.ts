"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface SignUp {
  name: string;
  email: string;
  password: string;
  terms: boolean;
  origin: string;
}

export const signUpAction = async ({
  name,
  email,
  password,
  terms,
  origin
}: SignUp): Promise<{ success: boolean; message: string }> => {
  if (terms === false) {
    return { success: false, message: "Aceite os termos de uso da plataforma" }
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      message: "Não foi possível realizar o cadastro. Tente novamente.",
    };
  }

  if (data.user?.identities?.length === 0) {
    return {
      success: false,
      message: "Este e-mail já está cadastrado. Por favor, faça login ou redefina sua senha.",
    }
  }

  return {
    success: true,
    message: "Verifique seu e-mail para continuar o processo de cadastro.",
  };
};
