'use server';

import {createClient} from '@/lib/supabase/server';
import {revalidatePath} from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const passwordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});


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

export async function updateUserPassword(prevState: any, formData: FormData) {
  const supabase = createClient();

  const password = formData.get('password') as string;
  
  const validation = passwordSchema.safeParse({ password });

  if (!validation.success) {
    return {
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }
  
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Password Update Error:', error);
    return {
      error: 'Não foi possível atualizar a senha. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/settings');

  return { error: null };
}

export async function deleteUserAccount() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { error: deletionError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  
  if (deletionError) {
    console.error('Error deleting user account:', deletionError.message);
    return {
      error: 'Ocorreu um erro e não foi possível excluir sua conta. Por favor, tente novamente.',
    };
  }
  
  // Sign out the user from the current session
  await supabase.auth.signOut();
  
  // No need to revalidate, just redirect
  redirect('/');
}
