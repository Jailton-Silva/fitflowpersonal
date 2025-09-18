"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface SignIn {
  email: string;
  password: string;
}

export const signInAction = async ({ email, password }: SignIn) => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    throw new Error(error?.message || "Credenciais inválidas");
  }

  return authData
}
