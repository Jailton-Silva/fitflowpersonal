
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Clock, Check } from 'lucide-react';
import PlanSelectionForm from './_components/plan-selection-form';

type PlanCard = {
    name: 'Free' | 'Start' | 'Pro' | 'Elite';
    price: string;
    description: string;
    features: string[];
    isCurrent: boolean;
    isPopular?: boolean;
    isDisabled?: boolean;
};

async function getTrainerProfile() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    console.log("biling data user =>", user);

    if (!user) {
        redirect('/login?next=/billing');
    }

    const { data: trainer, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', user.id)
        .single();
    
    console.log("biling data trainer =>", trainer);

    if (error || !trainer) {
        redirect('/dashboard?message=perfil-nao-encontrado');
    }

    return { user, trainer };
}

const planFeatures = {
    Free: [
        'Até 1 alunos ativos',
        'Criação de treinos básicos',
        'Suporte por email',
    ],
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

    // Determinar o plano atual do trainer
    const currentPlan = trainer.plan || 'Free';

    const plans: PlanCard[] = [
        {
            name: 'Free',
            price: '0',
            description: 'Plano gratuito para começar.',
            features: planFeatures.Free,
            isCurrent: currentPlan === 'Free',
        },
        {
            name: 'Start',
            price: '29',
            description: 'Ideal para quem está começando.',
            features: planFeatures.Start,
            isCurrent: currentPlan === 'Start',
        },
        {
            name: 'Pro',
            price: '59',
            description: 'Para personais que buscam crescimento.',
            features: planFeatures.Pro,
            isCurrent: currentPlan === 'Pro',
            isPopular: true,
        },
        {
            name: 'Elite',
            price: '99',
            description: 'Para top performers e estúdios.',
            features: planFeatures.Elite,
            isCurrent: currentPlan === 'Elite',
            isDisabled: true,
        }
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">
                    Planos e Preços
                </h1>
                <p className="text-muted-foreground">
                    Escolha o plano que melhor se adapta às suas necessidades. Você pode alterar seu plano a qualquer momento.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {plans.map(plan => (
                    <Card key={plan.name} className={`relative flex flex-col h-[26.25rem] ${plan.isCurrent ? 'border-primary border-2' : ''} ${plan.isPopular ? 'shadow-lg' : ''} ${plan.isDisabled ? 'opacity-75' : ''}`}>
                        {plan.isPopular && !plan.isCurrent && (
                            <div className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                                <Star className="h-4 w-4" /> Popular
                            </div>
                        )}
                        {plan.isCurrent && (
                            <div className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
                                <Check className="h-4 w-4" /> Plano Atual
                            </div>
                        )}
                        {plan.isDisabled && (
                            <div className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-sm font-bold text-white shadow-lg animate-pulse">
                                <Clock className="h-4 w-4" /> EM BREVE
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <p className="text-4xl font-bold">
                                {plan.price === '0' ? 'Grátis' : `R$${plan.price}`}
                                {plan.price !== '0' && <span className="text-lg font-normal text-muted-foreground">/mês</span>}
                            </p>
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
                            <PlanSelectionForm 
                                plan={plan.name} 
                                trainerId={trainer.id} 
                                isCurrent={plan.isCurrent} 
                                isDisabled={plan.isDisabled}
                                subscriptionStatus={trainer.subscription_status}
                            />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
