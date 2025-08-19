"use server";

import { createClient } from "@/lib/supabase/server";

interface SignUp {
  name: string;
  email: string;
  password: string;
  terms: string;
  origin: string;
}

export const signUpAction = async ({ name, email, password, terms, origin }: SignUp) => {
  if (terms !== "on") throw new Error("Aceite os termos de uso da plataforma")

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${origin}/auth/callback`
    }
  });

  if (error) {
    throw new Error("Não foi possível realizar o cadastro. O e-mail pode já estar em uso ou a senha é muito fraca.")
  };

  return data;
}
