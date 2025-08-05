
'use client';

import Link from "next/link";
import { Dumbbell, ArrowLeft, Loader2 } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

const passwordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormData = z.infer<typeof passwordSchema>;

export default function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: ''
    }
  });

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const supabase = createClient();
      const exchangeCode = async () => {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Exchange code error:', error);
          setError('O link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo.');
        }
        setIsVerifying(false);
      };
      exchangeCode();
    } else {
      setError('Nenhum código de redefinição encontrado. Por favor, utilize o link enviado para o seu e-mail.');
      setIsVerifying(false);
    }
  }, [searchParams]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    
    // By this point, the session should have been established by exchangeCodeForSession
    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      toast({ 
        title: 'Erro ao Alterar Senha', 
        description: 'Não foi possível atualizar a senha. O link pode ter expirado. Por favor, tente novamente.', 
        variant: 'destructive' 
      });
      console.error('Password Update Error:', error);
    } else {
      toast({ title: 'Sucesso!', description: 'Sua senha foi alterada. Você já pode fazer login.' });
      router.push('/login');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
             <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Crie uma Nova Senha</CardTitle>
          <CardDescription className="text-center">
            {isVerifying ? 'Verificando seu link...' : (error || 'Digite sua nova senha abaixo.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerifying ? (
             <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : error ? (
             <div className="text-center text-destructive p-4 bg-destructive/10 rounded-md">
                {error}
             </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  {...form.register('password')}
                />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full ripple" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Nova Senha
              </Button>
            </form>
          )}
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
