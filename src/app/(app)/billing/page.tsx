import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Clock, Check } from 'lucide-react';
import PlanSelectionForm from './_components/plan-selection-form';
import { getCachedPricingData } from '@/lib/stripe-pricing-cache';
import { formatPrice } from '@/lib/stripe-pricing';

async function getTrainerProfile() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?next=/billing');
    }

    const { data: trainer, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error || !trainer) {
        redirect('/dashboard?message=perfil-nao-encontrado');
    }

    return { user, trainer };
}

export default async function BillingPage() {
    const { trainer } = await getTrainerProfile();

    // Buscar preços dinâmicos do Stripe (com cache)
    const stripePlans = await getCachedPricingData();

    // Marcar plano atual
    const plansWithCurrentStatus = stripePlans.map(plan => ({
        ...plan,
        isCurrent: plan.name === trainer.plan,
    }));

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
                {plansWithCurrentStatus.map(plan => (
                    <Card 
                        key={plan.id} 
                        className={`relative flex flex-col h-[26.25rem] ${
                            plan.isCurrent ? 'border-primary border-2' : ''
                        } ${
                            plan.isPopular ? 'shadow-lg' : ''
                        } ${
                            plan.isDisabled ? 'opacity-75' : ''
                        }`}
                    >
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
                            <div className="space-y-1">
                                <p className="text-4xl font-bold">
                                    {plan.price === '0' ? 'Grátis' : formatPrice(parseFloat(plan.price))}
                                    {plan.price !== '0' && (
                                        <span className="text-lg font-normal text-muted-foreground">
                                            /{plan.interval === 'year' ? 'ano' : 'mês'}
                                        </span>
                                    )}
                                </p>
                                {plan.price !== '0' && plan.interval === 'year' && (
                                    <p className="text-sm text-muted-foreground">
                                        Economize 2 meses por ano
                                    </p>
                                )}
                            </div>
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
                                plan={plan.name as any}
                                trainerId={trainer.id}
                                isCurrent={plan.isCurrent}
                                isDisabled={plan.isDisabled}
                                subscriptionStatus={trainer.subscription_status}
                                priceId={plan.priceId}
                            />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}