
import {createClient} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {User, Shield, KeyRound} from 'lucide-react';
import ProfileForm from './profile-form';
import PasswordForm from './password-form';
import SubscriptionCard from './subscription-card';

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
        </div>

        <div>
          <SubscriptionCard trainer={trainer} />
        </div>
      </div>
    </div>
  );
}
