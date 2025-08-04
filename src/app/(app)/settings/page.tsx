
import {createClient} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {User, Shield} from 'lucide-react';
import {updateTrainerProfile} from './actions';
import {SubmitButton} from '@/components/auth/submit-button';

async function getTrainerProfile() {
  const supabase = createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const {data: trainer, error} = await supabase
    .from('trainers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !trainer) {
    notFound();
  }

  return {user, trainer};
}

export default async function SettingsPage() {
  const {user, trainer} = await getTrainerProfile();

  const updateProfileWithUserId = updateTrainerProfile.bind(null, user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Configurações</h1>
      <div className="grid gap-8 md:grid-cols-3">
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield /> Assinatura
              </CardTitle>
              <CardDescription>Gerencie seu plano e pagamentos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Seu plano atual:</p>
                <p className="font-bold text-primary text-lg">Plano Pro</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Gerenciar Assinatura
              </Button>
               <p className="text-xs text-muted-foreground text-center">
                O gerenciamento de assinaturas será habilitado em breve.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
