'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const planSchema = z.object({
  plan: z.enum(['Start', 'Pro', 'Elite']),
  trainerId: z.string().uuid(),
});

export async function updateUserPlan(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const rawFormData = Object.fromEntries(formData.entries());

  const validation = planSchema.safeParse(rawFormData);

  if (!validation.success) {
    return {
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { plan, trainerId } = validation.data;

  const { error } = await supabase
    .from('trainers')
    .update({ plan })
    .eq('id', trainerId);

  if (error) {
    console.error('Plan Update Error:', error);
    return {
      error: 'Não foi possível atualizar seu plano. Tente novamente.',
    };
  }

  revalidatePath('/settings');
  revalidatePath('/billing');
  return { error: null, success: true };
}
