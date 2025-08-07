
import PublicHeader from '@/components/layout/public-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <>
      <PublicHeader />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Política de Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Dados Coletados</h2>
            <p>Coletamos nome, email e dados de treino para personalizar sua experiência.</p>

            <h2>2. Finalidade</h2>
            <p>Os dados são usados para gestão de treinos e comunicação entre personal trainer e aluno.</p>

            <h2>3. Armazenamento</h2>
            <p>Seus dados são armazenados de forma segura no Supabase e na Vercel.</p>

            <h2>4. Compartilhamento</h2>
            <p>Não compartilhamos seus dados com terceiros, exceto para processamento de pagamentos via Stripe.</p>

            <h2>5. Seus Direitos</h2>
            <p>Você pode solicitar o acesso ou a exclusão dos seus dados a qualquer momento através da sua página de configurações.</p>

            <h2>6. Contato</h2>
            <p>Para dúvidas, entre em contato pelo email: [SEU EMAIL DE CONTATO].</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
