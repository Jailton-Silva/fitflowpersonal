import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { STRIPE_PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { plan, trainerId } = await request.json();

    if (!plan || !trainerId) {
      return NextResponse.json(
        { error: 'Plano e ID do treinador são obrigatórios' },
        { status: 400 }
      );
    }

    if (!STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o trainer pertence ao usuário
    const { data: trainer } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .eq('user_id', user.id)
      .single();

    if (!trainer) {
      return NextResponse.json(
        { error: 'Treinador não encontrado' },
        { status: 404 }
      );
    }

    const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      customer_email: trainer.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      metadata: {
        trainer_id: trainerId,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          trainer_id: trainerId,
          plan: plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
