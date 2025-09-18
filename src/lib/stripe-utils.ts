import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { Trainer } from '@/lib/definitions';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export interface StripeWebhookData {
  customerId: string;
  subscriptionId?: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'unpaid';
  plan?: Trainer['plan'];
  trainerId?: string;
  billingCycleEnd?: string;
}

/**
 * Converte timestamp Unix para ISO 8601 em UTC
 */
function convertUnixToISO(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toISOString();
}

/**
 * Busca informações da assinatura no Stripe
 */
async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      currentPeriodEnd: subscription.current_period_end,
      currentPeriodStart: subscription.current_period_start,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('❌ [STRIPE-UTILS] Erro ao buscar detalhes da assinatura:', error);
    return null;
  }
}

/**
 * Atualiza os dados do trainer baseado nos eventos do Stripe
 */
export async function updateTrainerFromStripe(cookieStore: ReadonlyRequestCookies, data: StripeWebhookData) {
  const supabase = createClient(cookieStore);

  const updateData: Partial<Trainer> = {
    stripe_customer_id: data.customerId,
    subscription_status: data.status,
    updated_at: new Date().toISOString(),
  };

  // Adicionar subscription_id se fornecido
  if (data.subscriptionId) {
    updateData.stripe_subscription_id = data.subscriptionId;
  }

  // Buscar billing_cycle_end do Stripe se tivermos subscriptionId
  if (data.subscriptionId && data.status === 'active') {
    const subscriptionDetails = await getSubscriptionDetails(data.subscriptionId);
    if (subscriptionDetails) {
      updateData.billing_cycle_end = convertUnixToISO(subscriptionDetails.currentPeriodEnd);
      console.log('📅 [STRIPE-UTILS] Billing cycle end definido:', updateData.billing_cycle_end);
    }
  } else if (data.billingCycleEnd) {
    // Usar billingCycleEnd fornecido diretamente
    updateData.billing_cycle_end = data.billingCycleEnd;
  }

  // Atualizar plano baseado no status da assinatura
  if (data.status === 'active' && data.plan) {
    updateData.plan = data.plan;
  } else if (data.status === 'canceled' || data.status === 'unpaid') {
    updateData.plan = 'Free';
    updateData.stripe_subscription_id = null;
    // Para assinaturas canceladas, definir billing_cycle_end como null ou data atual
    updateData.billing_cycle_end = new Date().toISOString();
  } else if (data.status === 'past_due') {
    // Manter o plano atual mas marcar como past_due
    // Não alterar o plano até que seja cancelado
  }

  // Determinar o filtro de busca
  const filterField = data.trainerId ? 'id' : 'stripe_customer_id';
  const filterValue = data.trainerId || data.customerId;

  // Primeiro, verificar se o trainer existe
  const { data: existingTrainer, error: fetchError } = await supabase
    .from('trainers')
    .select('id, name, email, stripe_customer_id, subscription_status, plan, billing_cycle_end')
    .eq(filterField, filterValue)
    .single();

  if (fetchError) {
    console.error('❌ [STRIPE-UTILS] Erro ao buscar trainer:', fetchError);
    throw new Error(`Trainer não encontrado: ${fetchError.message}`);
  }

  // Atualizar o trainer
  const { data: updatedTrainer, error } = await supabase
    .from('trainers')
    .update(updateData)
    .eq(filterField, filterValue)
    .select();

  if (error) {
    console.error('❌ [STRIPE-UTILS] Erro ao atualizar trainer:', error);
    throw new Error(`Falha ao atualizar trainer: ${error.message}`);
  }

  console.log('✅ [STRIPE-UTILS] Trainer atualizado com sucesso:', {
    trainerId: data.trainerId,
    customerId: data.customerId,
    status: data.status,
    plan: updateData.plan,
    billingCycleEnd: updateData.billing_cycle_end,
    updatedFields: Object.keys(updateData)
  });

  return { success: true, updatedTrainer: updatedTrainer?.[0] };
}

/**
 * Mapeia o status da assinatura do Stripe para o status interno
 */
export function mapStripeStatusToInternal(stripeStatus: string): Trainer['subscription_status'] {
  const statusMap: Record<string, Trainer['subscription_status']> = {
    'active': 'active',
    'trialing': 'active',
    'past_due': 'past_due',
    'canceled': 'canceled',
    'unpaid': 'unpaid',
    'incomplete': 'inactive',
    'incomplete_expired': 'inactive',
    'paused': 'inactive',
  };

  return statusMap[stripeStatus] || 'inactive';
}

/**
 * Determina o plano baseado no preço do Stripe
 */
export function getPlanFromPriceId(priceId: string): Trainer['plan'] {
  // Mapear os price IDs do Stripe para os planos internos
  const priceToPlanMap: Record<string, Trainer['plan']> = {
    [process.env.STRIPE_PRICE_START_ID || '']: 'Start',
    [process.env.STRIPE_PRICE_PRO_ID || '']: 'Pro',
    [process.env.STRIPE_PRICE_ELITE_ID || '']: 'Elite',
  };

  return priceToPlanMap[priceId] || 'Free';
}
