'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { updateUserPassword } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';

const passwordSchema = z.object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

const initialState = {
  error: null,
};


export default function PasswordForm() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(updateUserPassword, initialState);
  const form = useForm({
    resolver: zodResolver(passwordSchema),
  });

   useEffect(() => {
    if (state?.error) {
      toast({ title: 'Erro ao Alterar Senha', description: state.error, variant: 'destructive' });
    } else if (state?.error === null) {
      toast({ title: 'Sucesso!', description: 'Sua senha foi alterada.' });
      form.reset({ password: '' });
    }
  }, [state, toast, form]);


  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nova Senha</Label>
        <Input 
            id="password" 
            name="password" 
            type="password" 
            {...form.register('password')}
            required 
            />
         {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
      </div>
      <SubmitButton className="ripple">
        Salvar Nova Senha
      </SubmitButton>
    </form>
  );
}
