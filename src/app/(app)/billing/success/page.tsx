import { Suspense } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

async function getSessionData(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    return null;
  }
}

async function SuccessContent({ sessionId }: { sessionId: string }) {
  const session = await getSessionData(sessionId);
  
  if (!session) {
    return (
      <div className="text-center space-y-4">
        <div className="text-red-500">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Erro ao processar pagamento
        </h1>
        <p className="text-gray-600">
          Não foi possível verificar o status do seu pagamento. 
          Entre em contato conosco se você foi cobrado.
        </p>
        <Button asChild>
          <Link href="/billing">
            Voltar para Billing
          </Link>
        </Button>
      </div>
    );
  }

  const isSuccess = session.payment_status === 'paid';
  const plan = session.metadata?.plan || 'desconhecido';

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-500">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Pagamento realizado com sucesso!
        </h1>
        <p className="text-gray-600">
          Seu plano <strong>{plan}</strong> foi ativado com sucesso. 
          Você já pode aproveitar todos os recursos do seu novo plano.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/billing">
              Ver Detalhes do Plano
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              Ir para Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-yellow-500">
        <CheckCircle className="h-16 w-16 mx-auto mb-4" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">
        Pagamento pendente
      </h1>
      <p className="text-gray-600">
        Seu pagamento está sendo processado. Você receberá um email de confirmação 
        assim que o pagamento for aprovado.
      </p>
      <Button asChild>
        <Link href="/billing">
          Voltar para Billing
        </Link>
      </Button>
    </div>
  );
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <div className="text-center space-y-4">
        <div className="text-red-500">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Sessão inválida
        </h1>
        <p className="text-gray-600">
          Não foi possível identificar a sessão de pagamento.
        </p>
        <Button asChild>
          <Link href="/billing">
            Voltar para Billing
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <Suspense 
          fallback={
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-blue-500" />
              <p className="text-gray-600">Verificando pagamento...</p>
            </div>
          }
        >
          <SuccessContent sessionId={sessionId} />
        </Suspense>
      </div>
    </div>
  );
}
