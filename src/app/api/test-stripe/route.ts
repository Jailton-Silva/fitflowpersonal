import { NextRequest, NextResponse } from 'next/server';
import { updateTrainerFromStripe } from '@/lib/stripe-utils';

export async function POST(request: NextRequest) {
  try {
    const { trainerId, customerId, subscriptionId, plan, billingCycleEnd } = await request.json();

    if (!trainerId) {
      return NextResponse.json({ error: 'trainerId é obrigatório' }, { status: 400 });
    }

    console.log('🧪 [TEST] Iniciando teste de atualização do Stripe...');
    console.log('Dados recebidos:', { trainerId, customerId, subscriptionId, plan });

    // Testar atualização
    const result = await updateTrainerFromStripe({
      customerId: customerId || 'test_customer_123',
      subscriptionId: subscriptionId || 'test_sub_123',
      status: 'active',
      plan: plan || 'Start',
      trainerId,
      billingCycleEnd: billingCycleEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias no futuro
    });

    return NextResponse.json({
      success: true,
      message: 'Teste realizado com sucesso',
      result
    });

  } catch (error) {
    console.error('❌ [TEST] Erro no teste:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}