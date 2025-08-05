'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trainer } from '@/lib/definitions';
import { Shield, CheckCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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


export default function SubscriptionCard({ trainer }: { trainer: Trainer }) {
    const trialExpired = isPast(new Date(trainer.billing_cycle_end));
    
    return (
         <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield /> Assinatura
              </CardTitle>
              <CardDescription>Gerencie seu plano e pagamentos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Seu plano atual:</p>
                <p className="font-bold text-primary text-lg">{trainer.plan}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status:</p>
                <p className={`font-semibold ${trialExpired ? 'text-destructive' : 'text-green-600'}`}>
                    {trialExpired ? 'Período de teste expirado' : 'Período de teste ativo'}
                </p>
                <p className="text-xs text-muted-foreground">
                    Sua próxima fatura será em {format(new Date(trainer.billing_cycle_end), "dd/MM/yyyy", { locale: ptBR })}.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                  {planFeatures[trainer.plan].map(feature => (
                      <li key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{feature}</span>
                      </li>
                  ))}
              </ul>

              <Button variant="outline" className="w-full" disabled>
                Gerenciar Assinatura
              </Button>
               <p className="text-xs text-muted-foreground text-center">
                O gerenciamento de assinaturas será habilitado em breve.
              </p>
            </CardContent>
          </Card>
    )
}
