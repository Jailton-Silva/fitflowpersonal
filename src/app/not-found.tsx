
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <div className="flex flex-col items-center justify-center p-8 rounded-lg">
        <Dumbbell className="h-20 w-20 text-primary mb-6 animate-bounce" />
        <h1 className="text-8xl font-bold font-headline text-primary">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-foreground">Página Não Encontrada</h2>
        <p className="text-muted-foreground mt-4 max-w-md">
          Oops! Parece que você se perdeu no aquecimento. A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Button asChild className="ripple w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Página Inicial
            </Link>
          </Button>
           <Button asChild variant="secondary" className="w-full">
            <Link href="/dashboard">Ir para o Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
