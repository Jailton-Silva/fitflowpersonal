'use server';

import {createClient} from '@/lib/supabase/server';
import {revalidatePath} from 'next/cache';

export async function updateTrainerProfile(userId: string, formData: FormData) {
  const supabase = createClient();

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  const {error} = await supabase
    .from('trainers')
    .update({
      name: name,
      phone: phone || null,
    })
    .eq('user_id', userId);

  if (error) {
    return {
      error: 'Não foi possível atualizar o perfil. ' + error.message,
    };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard'); // To update header if name changes
  return {error: null};
}
