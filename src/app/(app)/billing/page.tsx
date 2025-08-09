
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Trainer, User } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star } from 'lucide-react';
import PlanSelectionForm from './plan-selection-form';


async function getTrainerProfile() {
  const supabase = createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const {data: trainer, error} = await supabase
    .from('trainers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !trainer) {
    notFound();
  }

  return {user, trainer};
}

const planFeatures = {
    Start: [
        'Até 20 alunos ativos',
        'Criação de treinos ilimitada',
        'Agenda e app para alunos',
    ],
    Pro: [
        'Até 100 alunos ativos',
        'Tudo do plano Start',
        'Assistente IA de exercícios',
        'Relatórios avançados',
    ],
    Elite: [
        'Alunos ilimitados',
        'Tudo do plano Pro',
        'Marca branca no app',
        'Múltiplos treinadores',
    ]
}


export default async function BillingPage() {
    const { trainer } = await getTrainerProfile();

    const plans = [
        {
            name: 'Start',
            price: '29',
            description: 'Ideal para quem está começando.',
            features: planFeatures.Start,
            isCurrent: trainer.plan === 'Start',
        },
        {
            name: 'Pro',
            price: '59',
            description: 'Para personais que buscam crescimento.',
            features: planFeatures.Pro,
            isCurrent: trainer.plan === 'Pro',
            isPopular: true,
        },
        {
            name: 'Elite',
            price: '99',
            description: 'Para top performers e estúdios.',
            features: planFeatures.Elite,
            isCurrent: trainer.plan === 'Elite',
        }
    ] as const;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Planos e Preços</h1>
                <p className="text-muted-foreground">Escolha o plano que melhor se adapta às suas necessidades. Você pode alterar seu plano a qualquer momento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {plans.map(plan => (
                    <Card key={plan.name} className={`relative flex flex-col ${plan.isCurrent ? 'border-primary border-2' : ''} ${plan.isPopular ? 'shadow-lg' : ''}`}>
                        {plan.isPopular && (
                            <div className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                                <Star className="h-4 w-4" /> Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <p className="text-4xl font-bold">R${plan.price}<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                           <PlanSelectionForm plan={plan.name} trainerId={trainer.id} isCurrent={plan.isCurrent} />
                        </CardFooter>
                    </Card>
                ))}
            </div>
             <p className="text-xs text-muted-foreground text-center pt-4">
                O gerenciamento de pagamentos e a integração com o checkout serão habilitados em breve.
              </p>
        </div>
    )
}
