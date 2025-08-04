'use server';

import {createClient} from '@/lib/supabase/server';
import {revalidatePath} from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';

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


export async function uploadTrainerAvatar(trainerId: string, formData: FormData) {
    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) {
        return { error: 'Nenhum arquivo enviado.' };
    }
    
    const supabase = createClient();
    const filePath = `trainer-${trainerId}/${file.name}-${new Date().getTime()}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true,
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return { error: `Erro no upload: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Use admin client to bypass RLS for updating the trainer's avatar URL
    const { error: updateError } = await supabaseAdmin
        .from('trainers')
        .update({ avatar_url: publicUrl })
        .eq('id', trainerId);
        
    if (updateError) {
        console.error('Update Error:', updateError);
        await supabase.storage.from('avatars').remove([filePath]);
        return { error: `Erro ao atualizar perfil: ${updateError.message}` };
    }
    
    revalidatePath('/settings');
    revalidatePath('/dashboard'); // To update header
    return { error: null, path: publicUrl };
}
