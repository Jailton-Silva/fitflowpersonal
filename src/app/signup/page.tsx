
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
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/auth/submit-button";
import { Checkbox } from "@/components/ui/checkbox";


export default function SignupPage({
  searchParams,
}: {
  searchParams: { message: string, type?: string };
}) {
  const signUp = async (formData: FormData) => {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const terms = formData.get("terms") as string;
    const origin = headers().get("origin");

    if (terms !== "on") {
      const url = new URL("/signup", origin!);
      url.searchParams.set("message", "Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.");
      url.searchParams.set("type", "error");
      return redirect(url.toString());
    }

    const supabase = createClient();
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      const url = new URL("/signup", origin!);
      url.searchParams.set("message", "Não foi possível realizar o cadastro. O e-mail pode já estar em uso ou a senha é muito fraca.");
      url.searchParams.set("type", "error");
      return redirect(url.toString());
    }

    const url = new URL("/signup", origin!);
    url.searchParams.set("message", "Verifique seu e-mail para continuar o processo de cadastro.");
    url.searchParams.set("type", "success");
    return redirect(url.toString());
  };

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
          {searchParams?.message && (
             <div className={`mb-4 p-4 text-center text-sm rounded-md ${searchParams.type === 'error' ? 'text-destructive bg-destructive/10' : 'text-foreground bg-accent/20'}`}>
              {searchParams.message}
            </div>
          )}
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
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
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="items-top flex space-x-2">
                <Checkbox id="terms" name="terms" />
                <div className="grid gap-1.5 leading-none">
                    <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                    Aceitar termos e condições
                    </label>
                    <p className="text-sm text-muted-foreground">
                    Você concorda com nossos <Link href="/terms-and-conditions" className="underline">Termos de Uso</Link> e <Link href="/privacy-policy" className="underline">Política de Privacidade</Link>.
                    </p>
                </div>
            </div>
             <SubmitButton
              formAction={signUp}
              className="w-full ripple"
            >
              Cadastrar
            </SubmitButton>
          </form>
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
