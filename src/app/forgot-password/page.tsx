
import Link from "next/link";
import { Dumbbell, ArrowLeft } from "lucide-react";
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

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {

  const sendResetLink = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const supabase = createClient();
    const origin = headers().get("origin");

    // Ensure the redirectTo URL is absolute and correct
    const redirectTo = `${origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
    });

    if (error) {
      console.error('Reset Password Error:', error);
      return redirect("/forgot-password?message=N&atilde;o foi poss&iacute;vel enviar o link de redefini&ccedil;&atilde;o. Verifique o e-mail digitado.");
    }

    return redirect("/forgot-password?message=Se o e-mail estiver cadastrado, um link para redefini&ccedil;&atilde;o de senha foi enviado.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
             <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Redefinir Senha</CardTitle>
          <CardDescription className="text-center">
            Digite seu e-mail e enviaremos um link para você voltar a acessar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.message && (
            <div className="mb-4 p-4 text-center text-sm text-foreground bg-accent/20 rounded-md break-words"
              dangerouslySetInnerHTML={{ __html: searchParams.message }}
            />
          )}
          <form className="grid gap-4" action={sendResetLink}>
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
            <SubmitButton className="w-full ripple">
              Enviar Link de Redefinição
            </SubmitButton>
          </form>
           <div className="mt-4 text-center text-sm">
            <Link href="/login" className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
