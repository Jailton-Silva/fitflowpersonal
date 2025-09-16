import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { add } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
        // On successful sign-up, create a corresponding trainer profile
        const { error: trainerError } = await supabase
          .from('trainers')
          .upsert({ 
            user_id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.name || data.user.email, // Fallback to email if name is not available
            plan: 'Pro', // Default to Pro plan on signup
            billing_cycle_end: add(new Date(), { days: 7 }).toISOString(), // 7-day free trial
          });
        
        if (trainerError) {
             console.error('Error creating trainer profile:', trainerError);
             // Redirect to an error page or show a message
            return NextResponse.redirect(`${origin}/login?message=Erro ao criar perfil de treinador.`);
        }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?message=Não foi possível fazer login. Tente novamente.`);
}
