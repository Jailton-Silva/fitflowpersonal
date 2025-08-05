
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <Dumbbell className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-6xl font-bold font-headline text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página Não Encontrada</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Oops! A página que você está procurando não existe ou foi movida.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild className="ripple">
          <Link href="/">Voltar para a Página Inicial</Link>
        </Button>
         <Button asChild variant="outline">
          <Link href="/dashboard">Ir para o Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
