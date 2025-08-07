'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Trash2 } from 'lucide-react';
import ProfileForm from './profile-form';
import PasswordForm from './password-form';
import SubscriptionCard from './subscription-card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { deleteUserAccount } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Trainer } from '@/lib/definitions';
import type { User } from '@supabase/supabase-js';


interface SettingsClientPageProps {
  user: User;
  trainer: Trainer;
}

const DELETE_CONFIRMATION_TEXT = 'EXCLUIR';

export default function SettingsClientPage({ user, trainer }: SettingsClientPageProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleAccountDeletion = async () => {
    if (confirmationInput !== DELETE_CONFIRMATION_TEXT) {
      toast({
        title: 'Confirmação incorreta',
        description: 'Você precisa digitar a palavra de confirmação para excluir a conta.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    const result = await deleteUserAccount();
    
    if (result?.error) {
        toast({
            title: 'Erro ao excluir conta',
            description: result.error,
            variant: 'destructive',
        });
        setIsDeleting(false);
    } else {
        toast({
            title: 'Conta excluída',
            description: 'Sua conta e todos os seus dados foram removidos. Você será redirecionado.',
        });
        // The redirection will happen on the server action
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Configurações da Conta</h1>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <ProfileForm trainer={trainer} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound /> Segurança
              </CardTitle>
              <CardDescription>
                Altere sua senha de acesso à plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
          
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 /> Zona de Perigo
              </CardTitle>
              <CardDescription>
                A exclusão da sua conta é uma ação permanente e irreversível. Todos os seus dados, incluindo informações de alunos, treinos e histórico, serão permanentemente removidos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Excluir minha conta</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Para confirmar a exclusão, digite <strong>{DELETE_CONFIRMATION_TEXT}</strong> no campo abaixo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input 
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    placeholder={`Digite ${DELETE_CONFIRMATION_TEXT} para confirmar`}
                    className="my-4"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmationInput('')}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleAccountDeletion}
                      disabled={confirmationInput !== DELETE_CONFIRMATION_TEXT || isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Excluindo...' : 'Eu entendo, excluir minha conta'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

        </div>

        <div>
          <SubscriptionCard trainer={trainer} />
        </div>
      </div>
    </div>
  );
}
