import Link from "next/link";
import { Dumbbell } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "./_components/sign-up-form";

export default async function SignupPage() {
  // const signUp = async (formData: FormData) => {
  //   "use server";

  //   const name = formData.get("name") as string;
  //   const email = formData.get("email") as string;
  //   const password = formData.get("password") as string;
  //   const terms = formData.get("terms") as string;
  //   const origin = headers().get("origin");

  //   if (terms !== "on") {
  //     const url = new URL("/signup", origin!);
  //     url.searchParams.set("message", "Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.");
  //     url.searchParams.set("type", "error");
  //     return redirect(url.toString());
  //   }

  //   const supabase = createClient();

  //   const { error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       data: {
  //         name: name,
  //       },
  //       emailRedirectTo: `${origin}/auth/callback`,
  //     },
  //   });

  //   if (error) {
  //     const url = new URL("/signup", origin!);
  //     url.searchParams.set("message", "Não foi possível realizar o cadastro. O e-mail pode já estar em uso ou a senha é muito fraca.");
  //     url.searchParams.set("type", "error");
  //     return redirect(url.toString());
  //   }

  //   const url = new URL("/signup", origin!);
  //   url.searchParams.set("message", "Verifique seu e-mail para continuar o processo de cadastro.");
  //   url.searchParams.set("type", "success");
  //   return redirect(url.toString());
  // };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Crie sua Conta</CardTitle>
          <CardDescription className="text-center">
            Insira suas informações para começar a usar o FitFlow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />

          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
