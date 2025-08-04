
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Upload, Loader2 } from 'lucide-react';
import { SubmitButton } from '@/components/auth/submit-button';
import { Trainer } from '@/lib/definitions';
import { updateTrainerProfile, uploadTrainerAvatar } from './actions';
import { useTransition, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório.'),
  phone: z.string().optional(),
});

export default function ProfileForm({ trainer }: { trainer: Trainer }) {
  const { toast } = useToast();
  const [isUploading, startUploadTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(trainer.avatar_url || null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: trainer.name || '',
      phone: trainer.phone || '',
    },
  });

  const updateProfileWithUserId = updateTrainerProfile.bind(null, trainer.user_id);

   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('avatar', file);
      startUploadTransition(async () => {
         const { error } = await uploadTrainerAvatar(trainer.id, formData);
          if (error) {
              toast({ title: "Erro no Upload", description: error, variant: "destructive" });
          } else {
              toast({ title: "Sucesso!", description: "Avatar atualizado."});
          }
      });
    }
  };

  return (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col items-center gap-4 pt-6">
            <Avatar className="w-32 h-32 border-2 border-primary relative group">
                <AvatarImage src={avatarPreview || undefined} alt={trainer.name} />
                <AvatarFallback className="text-4xl">{trainer.name?.charAt(0)}</AvatarFallback>
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}
            </Avatar>
            <Button asChild variant="outline">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4"/> Alterar Foto
                    <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                </label>
            </Button>
        </div>
        <div className="md:col-span-2">
            <form action={updateProfileWithUserId}>
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <User /> Perfil Público
                    </CardTitle>
                    <CardDescription>
                    Estas informações podem ser vistas por seus alunos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" name="name" defaultValue={trainer.name} required />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={trainer.email} disabled />
                    <p className="text-xs text-muted-foreground">
                        O email não pode ser alterado.
                    </p>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (Opcional)</Label>
                    <Input id="phone" name="phone" defaultValue={trainer.phone || ''} />
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton className="ripple">Salvar Alterações</SubmitButton>
                </CardFooter>
                </Card>
            </form>
        </div>
    </div>
  );
}
