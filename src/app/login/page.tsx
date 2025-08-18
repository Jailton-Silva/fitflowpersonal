import Link from "next/link";
import { Dumbbell } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "./_components/sign-in-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
             <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Bem-vindo ao FitFlow</CardTitle>
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
          <SignInForm />
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/signup" className="underline">
              Cadastre-se
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline">
              Retornar para home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
