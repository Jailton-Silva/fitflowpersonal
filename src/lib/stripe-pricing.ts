import { stripe } from '@/lib/stripe';
import { Trainer } from '@/lib/definitions';

export interface StripePlanData {
  id: string;
  name: string;
  price: string;
  priceId: string;
  productId: string;
  description: string;
  features: string[];
  isCurrent: boolean;
  isPopular?: boolean;
  isDisabled?: boolean;
  interval: 'month' | 'year';
  currency: string;
}

/**
 * Busca todos os produtos e preços do Stripe
 */
export async function getStripePricingData(): Promise<StripePlanData[]> {
  try {
    // Buscar produtos ativos
    const products = await stripe.products.list({
      active: true,
      limit: 10,
    });

    // Buscar preços ativos
    const prices = await stripe.prices.list({
      active: true,
      limit: 20,
      expand: ['data.product'],
    });

    // Mapear produtos para planos
    const planMapping: Record<string, Partial<StripePlanData>> = {
      [process.env.STRIPE_PLAN_START_ID || '']: {
        name: 'Start',
        description: 'Ideal para quem está começando.',
        features: [
          'Até 20 alunos ativos',
          'Criação de treinos ilimitada',
          'Agenda e app para alunos',
        ],
        isPopular: true,
      },
      [process.env.STRIPE_PLAN_PRO_ID || '']: {
        name: 'Pro',
        description: 'Para personais que buscam crescimento.',
        features: [
          'Até 100 alunos ativos',
          'Tudo do plano Start',
          'Assistente IA de exercícios',
          'Relatórios avançados',
        ],
        isPopular: true,
      },
      [process.env.STRIPE_PLAN_ELITE_ID || '']: {
        name: 'Elite',
        description: 'Para top performers e estúdios.',
        features: [
          'Alunos ilimitados',
          'Tudo do plano Pro',
          'Marca branca no app',
          'Múltiplos treinadores',
        ],
        isDisabled: true,
      },
    };

    // Criar plano gratuito
    const freePlan: StripePlanData = {
      id: 'free',
      name: 'Free',
      price: '0',
      priceId: '',
      productId: '',
      description: 'Plano gratuito para começar.',
      features: [
        'Até 1 alunos ativos',
        'Criação de treinos básicos',
        'Suporte por email',
      ],
      isCurrent: false,
      interval: 'month',
      currency: 'brl',
    };

    // Processar preços e criar planos
    const stripePlans: StripePlanData[] = [freePlan];

    for (const price of prices.data) {
      const product = price.product as any;
      const productId = product.id;
      const planConfig = planMapping[productId];

      if (planConfig && product.active) {
        const amount = price.unit_amount || 0;
        const formattedPrice = (amount / 100).toFixed(0);

        stripePlans.push({
          id: price.id,
          name: planConfig.name!,
          price: formattedPrice,
          priceId: price.id,
          productId: productId,
          description: planConfig.description!,
          features: planConfig.features!,
          isCurrent: false,
          isPopular: planConfig.isPopular || false,
          isDisabled: planConfig.isDisabled || false,
          interval: price.recurring?.interval || 'month',
          currency: price.currency.toUpperCase(),
        });
      }
    }

    // Ordenar planos: Free, Start, Pro, Elite
    const planOrder = ['Free', 'Start', 'Pro', 'Elite'];
    stripePlans.sort((a, b) => {
      const aIndex = planOrder.indexOf(a.name);
      const bIndex = planOrder.indexOf(b.name);
      return aIndex - bIndex;
    });

    return stripePlans;
  } catch (error) {
    console.error('❌ [STRIPE-PRICING] Erro ao buscar preços do Stripe:', error);
    
    // Retornar planos padrão em caso de erro
    return [
      {
        id: 'free',
        name: 'Free',
        price: '0',
        priceId: '',
        productId: '',
        description: 'Plano gratuito para começar.',
        features: [
          'Até 1 alunos ativos',
          'Criação de treinos básicos',
          'Suporte por email',
        ],
        isCurrent: false,
        interval: 'month',
        currency: 'BRL',
      },
      {
        id: 'start-fallback',
        name: 'Start',
        price: '29',
        priceId: process.env.STRIPE_PRICE_START_ID || '',
        productId: process.env.STRIPE_PLAN_START_ID || '',
        description: 'Ideal para quem está começando.',
        features: [
          'Até 20 alunos ativos',
          'Criação de treinos ilimitada',
          'Agenda e app para alunos',
        ],
        isCurrent: false,
        isPopular: true,
        interval: 'month',
        currency: 'BRL',
      },
      {
        id: 'pro-fallback',
        name: 'Pro',
        price: '59',
        priceId: process.env.STRIPE_PRICE_PRO_ID || '',
        productId: process.env.STRIPE_PLAN_PRO_ID || '',
        description: 'Para personais que buscam crescimento.',
        features: [
          'Até 100 alunos ativos',
          'Tudo do plano Start',
          'Assistente IA de exercícios',
          'Relatórios avançados',
        ],
        isCurrent: false,
        isPopular: true,
        interval: 'month',
        currency: 'BRL',
      },
      {
        id: 'elite-fallback',
        name: 'Elite',
        price: '99',
        priceId: process.env.STRIPE_PRICE_ELITE_ID || '',
        productId: process.env.STRIPE_PLAN_ELITE_ID || '',
        description: 'Para top performers e estúdios.',
        features: [
          'Alunos ilimitados',
          'Tudo do plano Pro',
          'Marca branca no app',
          'Múltiplos treinadores',
        ],
        isCurrent: false,
        isDisabled: true,
        interval: 'month',
        currency: 'BRL',
      },
    ];
  }
}

/**
 * Formata preço para exibição
 */
export function formatPrice(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Obtém informações de um plano específico
 */
export async function getPlanDetails(planName: string): Promise<StripePlanData | null> {
  const plans = await getStripePricingData();
  return plans.find(plan => plan.name === planName) || null;
}
