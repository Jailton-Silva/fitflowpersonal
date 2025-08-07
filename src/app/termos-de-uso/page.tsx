
import PublicHeader from '@/components/layout/public-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <>
      <PublicHeader />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Termos de Uso</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Aceitação dos Termos</h2>
            <p>Ao se cadastrar e utilizar a plataforma, você concorda em cumprir com os seguintes Termos de Uso.</p>
            
            <h2>2. Coleta e Uso de Dados</h2>
            <p>Coletamos dados como nome, email e histórico de treinos para fornecer e melhorar nossos serviços. Nossa Política de Privacidade detalha como seus dados são usados e protegidos.</p>

            <h2>3. Responsabilidades do Usuário</h2>
            <p>Você é responsável pela veracidade das informações fornecidas e pela segurança de sua conta.</p>

            <h2>4. Propriedade Intelectual</h2>
            <p>Todo o conteúdo da plataforma é de nossa propriedade intelectual.</p>

            <h2>5. Limitação de Responsabilidade</h2>
            <p>Não nos responsabilizamos por lesões ou quaisquer outros danos resultantes do uso da plataforma.</p>

            <h2>6. Modificações nos Termos</h2>
            <p>Podemos atualizar estes termos a qualquer momento. Notificaremos sobre mudanças significativas.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
