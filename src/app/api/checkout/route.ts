import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { STRIPE_PLANS } from '@/lib/stripe';
import { getPlanDetails } from '@/lib/stripe-pricing';

export async function POST(request: NextRequest) {
  try {
    const { plan, trainerId, priceId } = await request.json();

    if (!plan || !trainerId) {
      return NextResponse.json(
        { error: 'Plano e ID do treinador são obrigatórios' },
        { status: 400 }
      );
    }

    // Para plano gratuito, não criar checkout
    if (plan === 'Free') {
      return NextResponse.json(
        { error: 'Plano gratuito não requer pagamento' },
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

    // Determinar o priceId a ser usado
    let finalPriceId: string;

    if (priceId) {
      // Usar priceId fornecido (dinâmico)
      finalPriceId = priceId;
    } else {
      // Fallback para configuração estática
      const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
      if (!planConfig?.priceID) {
        return NextResponse.json(
          { error: 'Configuração de preço não encontrada para este plano' },
          { status: 400 }
        );
      }
      finalPriceId = planConfig.priceID;
    }

    // Verificar se o priceId existe no Stripe
    try {
      await stripe.prices.retrieve(finalPriceId);
    } catch (error) {
      console.error('Erro ao verificar priceId:', error);
      return NextResponse.json(
        { error: 'Preço inválido ou não encontrado' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      customer_email: trainer.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      metadata: {
        trainer_id: trainerId,
        plan: plan,
        price_id: finalPriceId,
      },
      subscription_data: {
        metadata: {
          trainer_id: trainerId,
          plan: plan,
          price_id: finalPriceId,
        },
      },
      // Configurações adicionais para melhorar a experiência
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,
    });

    console.log('✅ [CHECKOUT] Sessão criada com sucesso:', {
      sessionId: session.id,
      plan,
      priceId: finalPriceId,
      trainerId
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ [CHECKOUT] Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
