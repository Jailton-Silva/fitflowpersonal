
import {createClient} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';
import SettingsClientPage from './settings-client-page';
import { Trainer, User } from '@/lib/definitions';

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

  return <SettingsClientPage user={user as User} trainer={trainer as Trainer} />;
}
