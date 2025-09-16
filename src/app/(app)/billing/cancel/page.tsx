import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center space-y-4">
          <div className="text-red-500">
            <XCircle className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pagamento cancelado
          </h1>
          <p className="text-gray-600">
            Seu pagamento foi cancelado. Nenhuma cobrança foi realizada. 
            Você pode tentar novamente a qualquer momento.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/billing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Billing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Ir para Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
