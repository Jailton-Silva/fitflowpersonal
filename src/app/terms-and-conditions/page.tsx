import Link from "next/link";
import LandingPageHeader from "@/components/layout/landing-header";

export default function TermsOfUsePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingPageHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="prose prose-stone dark:prose-invert max-w-4xl mx-auto">
            <h1 className="font-headline text-4xl mb-4">Termos de Uso</h1>
            <p className="text-muted-foreground text-sm">Última atualização: 24 de Julho de 2024</p>

            <p className="mt-6">Bem-vindo ao FitFlow. Ao se cadastrar e utilizar nossa plataforma, você concorda com estes Termos de Uso. Por favor, leia-os com atenção.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta ou usar os serviços FitFlow, você estabelece um contrato vinculativo com a nossa empresa e declara que tem idade legal para fazê-lo. Você concorda em cumprir estes Termos e todas as leis e regulamentos aplicáveis.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">2. Descrição do Serviço</h2>
            <p>O FitFlow é uma plataforma de software como serviço (SaaS) projetada para ajudar Personal Trainers a gerenciar seus alunos, criar programas de treino, acompanhar o progresso e administrar seus negócios de forma mais eficiente.</p>
            <p>O serviço inclui uma interface para o personal trainer e um portal para o aluno (via PWA).</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">3. Uso da Plataforma</h2>
            <p><strong>Para Personal Trainers:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Você é o <strong>Controlador dos Dados</strong> dos seus alunos. Isso significa que você é responsável por obter o consentimento necessário para coletar e processar as informações deles através da nossa plataforma, em conformidade com a LGPD.</li>
              <li>Você se compromete a não enviar spam, não violar a privacidade dos seus alunos e a usar a plataforma de forma ética e profissional.</li>
              <li>Sua assinatura é pessoal e intransferível, a menos que seu plano permita múltiplos treinadores.</li>
            </ul>
            <p className="mt-4"><strong>Para Alunos:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Seu acesso é concedido e gerenciado pelo seu personal trainer.</li>
              <li>Você entende que seu personal trainer tem acesso aos dados que você insere ou que são gerados na plataforma.</li>
              <li>Para questões sobre seus dados, o primeiro contato deve ser seu personal trainer.</li>
            </ul>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">4. Planos, Pagamentos e Cancelamento</h2>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Período de Teste:</strong> Oferecemos um período de teste gratuito de 7 dias. Após esse período, é necessário escolher um plano pago para continuar utilizando os serviços.</li>
              <li><strong>Pagamento:</strong> As assinaturas são cobradas de forma recorrente (mensal ou anual) e antecipada. O pagamento é processado por nosso parceiro de pagamentos.</li>
              <li><strong>Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento através do painel de configurações. O acesso ao serviço continuará até o final do período já pago. Não oferecemos reembolso por períodos parciais de uso.</li>
            </ul>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">5. Propriedade Intelectual</h2>
            <p>Todo o software, design, textos e gráficos da plataforma são de propriedade exclusiva do FitFlow. Você não tem permissão para copiar, modificar ou distribuir nosso conteúdo sem autorização prévia.</p>
            <p>O conteúdo que você (personal trainer) insere na plataforma, como dados de alunos e treinos específicos, pertence a você.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">6. Limitação de Responsabilidade</h2>
            <p>O FitFlow é uma ferramenta para auxiliar profissionais de educação física. Não nos responsabilizamos por lesões, resultados de treinos ou qualquer outra questão decorrente da relação entre o personal trainer e o aluno.</p>
            <p>A plataforma é fornecida "como está", e não garantimos que o serviço será ininterrupto ou livre de erros. Nossa responsabilidade total em qualquer circunstância limita-se ao valor pago por você nos últimos 12 meses.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">7. Modificações nos Termos</h2>
            <p>Podemos revisar estes Termos de Uso periodicamente. A versão mais atual estará sempre disponível em nosso site. Notificaremos sobre alterações significativas por e-mail ou através de um aviso na plataforma.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">8. Contato</h2>
            <p>Para qualquer dúvida relacionada a estes Termos de Uso, entre em contato conosco pelo e-mail: <a href="mailto:suporte@fitflow.com.br">suporte@fitflow.com.br</a>.</p>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 FitFlow. Porque ser personal trainer também é ser empresário.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms-and-conditions" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Termos de Uso
          </Link>
          <Link href="/privacy-policy" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacidade
          </Link>
          <Link href="/#faq" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Dúvidas? (FAQ)
          </Link>
        </nav>
      </footer>
    </div>
  );
}
