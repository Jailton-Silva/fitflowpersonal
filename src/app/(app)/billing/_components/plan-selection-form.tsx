'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle, BadgeCheck } from 'lucide-react';
import { Trainer } from '@/lib/definitions';

export default function PlanSelectionForm({
  plan,
  trainerId,
  isCurrent,
  isDisabled = false,
  subscriptionStatus,
  priceId,
}: {
  plan: Trainer['plan'];
  trainerId: string;
  isCurrent: boolean;
  isDisabled?: boolean;
  subscriptionStatus?: string;
  priceId?: string;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (isCurrent || isLoading || isDisabled) return;

    // Para o plano gratuito, não fazer checkout
    if (plan === 'Free') {
      toast({
        title: 'Plano Gratuito',
        description: 'Você já está no plano gratuito. Faça upgrade para acessar mais recursos.',
        variant: 'default',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          trainerId,
          priceId, // Incluir priceId se disponível
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      }

      if (data.url) {
        // Redirecionar para o Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não encontrada');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isCurrent) {
      if (subscriptionStatus === 'active') {
        return 'Plano Ativo';
      } else if (subscriptionStatus === 'past_due') {
        return 'Pagamento Pendente';
      } else if (subscriptionStatus === 'canceled') {
        return 'Plano Cancelado';
      }
      return 'Plano Atual';
    }
    
    if (isLoading) return 'Processando...';
    if (isDisabled) return 'Em Breve';
    return plan === 'Free' ? 'Permanecer Grátis' : 'Assinar Plano';
  };

  const getButtonIcon = () => {
    if (isCurrent && subscriptionStatus === 'active') {
      return <CheckCircle className="mr-2 h-4 w-4" />;
    }
    if (!isLoading && !isCurrent && !isDisabled) {
      return plan === 'Free' ? <BadgeCheck className="mr-2 h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />;
    }
    return null;
  };

  const getButtonVariant = () => {
    if (isCurrent) return 'secondary';
    if (isDisabled) return 'outline';
    if (plan === 'Free') return 'outline';
    return 'default';
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        className="w-full ripple"
        onClick={handleCheckout}
        disabled={isCurrent || isLoading || isDisabled}
        variant={getButtonVariant()}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && getButtonIcon()}
        {getButtonText()}
      </Button>
    </div>
  );
}