
'use client';

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
import { SubmitButton } from "@/components/auth/submit-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useActionState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


const passwordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

const initialState = {
  error: null as string | null,
  success: false,
};

// This server action now correctly handles the password update.
// Supabase JS client automatically handles the session from the recovery link.
async function updatePassword(prevState: any, formData: FormData) {
    const password = formData.get("password") as string;
    
    const validation = passwordSchema.safeParse({ password });
    if (!validation.success) {
      return { error: validation.error.errors.map((e) => e.message).join(', '), success: false };
    }
    
    const supabase = createClient();
    
    // No need to exchange code manually. The Supabase client handles the session
    // when the user lands on this page from the email link.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error('Password Update Error:', error);
        return { error: 'Não foi possível atualizar a senha. O link pode ter expirado ou ser inválido. Por favor, tente novamente.', success: false };
    }
    
    return { error: null, success: true };
}

export default function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(updatePassword, initialState);

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: ''
    }
  });

   useEffect(() => {
    if (state.error) {
      toast({ title: 'Erro ao Alterar Senha', description: state.error, variant: 'destructive' });
    }
    if (state.success) {
      toast({ title: 'Sucesso!', description: 'Sua senha foi alterada. Você já pode fazer login.' });
      router.push('/login');
    }
  }, [state, toast, router]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
             <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Crie uma Nova Senha</CardTitle>
          <CardDescription className="text-center">
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            <SubmitButton className="w-full ripple">
              Salvar Nova Senha
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
