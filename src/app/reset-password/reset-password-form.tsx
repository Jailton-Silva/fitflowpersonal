
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
import { useRouter } from "next/navigation";

const passwordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormData = z.infer<typeof passwordSchema>;

export default function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // This effect handles the session from the URL fragment
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // This listener is not strictly necessary for the reset flow but can be useful
        // for debugging or handling other auth state changes.
        if (event === 'PASSWORD_RECOVERY') {
            // The session is now available, user can set a new password.
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    
    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      toast({ 
        title: 'Erro ao Alterar Senha', 
        description: 'Não foi possível atualizar a senha. O link pode ter expirado ou já ter sido utilizado. Por favor, tente novamente.', 
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
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
