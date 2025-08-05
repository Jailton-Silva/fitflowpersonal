
import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/auth/submit-button";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {

  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const url = new URL("/login", "https://fitflowpersonal.vercel.app");
      url.searchParams.set("message", "E-mail ou senha inválidos. Por favor, tente novamente.");
      return redirect(url.toString());
    }

    return redirect("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
             <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Bem-vindo de Volta</CardTitle>
          <CardDescription className="text-center">
            Digite seu e-mail abaixo para fazer login em sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.message && (
            <div className="mb-4 p-4 text-center text-sm text-destructive bg-destructive/10 rounded-md">
              {searchParams.message}
            </div>
          )}
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@exemplo.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <SubmitButton
              formAction={signIn}
              className="w-full ripple"
            >
              Login
            </SubmitButton>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/signup" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
