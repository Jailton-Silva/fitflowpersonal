import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { updateTrainerFromStripe, mapStripeStatusToInternal, getPlanFromPriceId } from '@/lib/stripe-utils';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ [WEBHOOK] Erro na verificação do webhook:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const trainerId = session.metadata?.trainer_id;
        const plan = session.metadata?.plan;

        if (trainerId) {
          try {
            if (session.payment_status === 'paid') {
              // Pagamento bem-sucedido - o billing_cycle_end será buscado automaticamente
              await updateTrainerFromStripe({
                customerId,
                subscriptionId,
                status: 'active',
                plan: plan || 'Start',
                trainerId
              });
            } else {
              // Pagamento falhou ou foi cancelado
              await updateTrainerFromStripe({
                customerId,
                subscriptionId,
                status: 'unpaid',
                plan: 'Free',
                trainerId
              });
              console.log('❌ [WEBHOOK] Pagamento falhou ou foi cancelado');
            }
          } catch (error) {
            console.error('❌ [WEBHOOK] Erro ao processar checkout session:', error);
          }
        } else {
          console.warn('⚠️ [WEBHOOK] trainerId não encontrado nos metadados');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const currentPeriodEnd = subscription.current_period_end;

        console.log('🔄 [WEBHOOK] Subscription updated:', {
          subscriptionId: subscription.id,
          customerId,
          status,
          priceId,
          currentPeriodEnd
        });

        try {
          const internalStatus = mapStripeStatusToInternal(status);
          const plan = priceId ? getPlanFromPriceId(priceId) : undefined;
          
          // Converter current_period_end para ISO 8601
          const billingCycleEnd = currentPeriodEnd 
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : undefined;

          await updateTrainerFromStripe({
            customerId,
            subscriptionId: subscription.id,
            status: internalStatus,
            plan,
            billingCycleEnd
          });

          console.log('✅ [WEBHOOK] Status da assinatura atualizado com sucesso');
        } catch (error) {
          console.error('❌ [WEBHOOK] Erro ao atualizar status da assinatura:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        console.log('🗑️ [WEBHOOK] Subscription deleted:', {
          subscriptionId: subscription.id,
          customerId
        });

        try {
          await updateTrainerFromStripe({
            customerId,
            subscriptionId: subscription.id,
            status: 'canceled',
            plan: 'Free'
          });

          console.log('✅ [WEBHOOK] Assinatura cancelada com sucesso');
        } catch (error) {
          console.error('❌ [WEBHOOK] Erro ao cancelar assinatura:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;

        console.log('💳 [WEBHOOK] Payment succeeded:', {
          invoiceId: invoice.id,
          customerId,
          subscriptionId,
          amount: invoice.amount_paid
        });

        try {
          await updateTrainerFromStripe({
            customerId,
            subscriptionId,
            status: 'active'
          });

          console.log('✅ [WEBHOOK] Pagamento processado com sucesso');
        } catch (error) {
          console.error('❌ [WEBHOOK] Erro ao processar pagamento bem-sucedido:', error);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;

        console.log('💸 [WEBHOOK] Payment failed:', {
          invoiceId: invoice.id,
          customerId,
          subscriptionId,
          amount: invoice.amount_due
        });

        try {
          await updateTrainerFromStripe({
            customerId,
            subscriptionId,
            status: 'past_due'
          });

          console.log('❌ [WEBHOOK] Pagamento falhou - status atualizado para past_due');
        } catch (error) {
          console.error('❌ [WEBHOOK] Erro ao marcar pagamento como falhado:', error);
        }
        break;
      }

      default:
        console.log(`ℹ️ [WEBHOOK] Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}