'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { X, UserPlus, Dumbbell } from 'lucide-react';

// A simple in-memory state for dismissal, in a real app you might use localStorage or a database flag
let hasBeenDismissed = false;

export default function OnboardingGuide() {
  const [isVisible, setIsVisible] = useState(!hasBeenDismissed);

  const handleDismiss = () => {
    hasBeenDismissed = true;
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="relative bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <CardTitle>Bem-vindo ao FitFlow!</CardTitle>
        <CardDescription>Siga estes primeiros passos para começar a gerenciar seus alunos e treinos de forma eficiente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-3 rounded-lg border">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">1. Cadastre seu primeiro aluno</h3>
            <p className="text-sm text-muted-foreground">Adicione os dados do seu aluno para começar a montar o plano de treino dele.</p>
            <Button asChild variant="link" className="p-0 h-auto">
              <Link href="/students">Cadastrar Aluno</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-lg border">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">2. Crie seu primeiro treino</h3>
            <p className="text-sm text-muted-foreground">Monte um treino personalizado para um aluno ou crie um modelo para reutilizar.</p>
            <Button asChild variant="link" className="p-0 h-auto">
              <Link href="/templates/new">Criar Modelo de Treino</Link>
            </Button>
          </div>
        </div>
      </CardContent>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={handleDismiss}
        aria-label="Fechar guia de onboarding"
      >
        <X className="h-4 w-4" />
      </Button>
    </Card>
  );
}
