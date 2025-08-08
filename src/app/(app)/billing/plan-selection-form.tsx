'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserPlan } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Trainer } from '@/lib/definitions';

function SubmitButton({ isCurrent }: { isCurrent: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full ripple"
      disabled={pending || isCurrent}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isCurrent ? 'Plano Atual' : 'Selecionar Plano'}
    </Button>
  );
}

export default function PlanSelectionForm({
  plan,
  trainerId,
  isCurrent,
}: {
  plan: Trainer['plan'];
  trainerId: string;
  isCurrent: boolean;
}) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateUserPlan, { error: null });

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Erro ao alterar o plano',
        description: state.error,
        variant: 'destructive',
      });
    }
    if (state?.success) {
      toast({
        title: 'Plano atualizado!',
        description: `Seu plano foi alterado para ${plan} com sucesso.`,
      });
    }
  }, [state, toast, plan]);

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="trainerId" value={trainerId} />
      <SubmitButton isCurrent={isCurrent} />
    </form>
  );
}
