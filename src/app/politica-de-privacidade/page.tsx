import Link from "next/link";
import LandingPageHeader from "@/components/layout/landing-header";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingPageHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="prose prose-stone dark:prose-invert max-w-4xl mx-auto">
            <h1 className="font-headline text-4xl mb-4">Política de Privacidade</h1>
            <p className="text-muted-foreground text-sm">Última atualização: 24 de Julho de 2024</p>

            <p className="mt-6">A sua privacidade é fundamental para nós do FitFlow. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você utiliza nossa plataforma e serviços.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">1. Informações que Coletamos</h2>
            <p>Para fornecer e aprimorar nossos serviços, coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Informações de Cadastro do Personal Trainer:</strong> Nome completo, e-mail, senha, CPF/CNPJ, informações de pagamento e perfil profissional.</li>
              <li><strong>Informações de Cadastro do Aluno:</strong> Nome completo, e-mail, e outros dados que o personal trainer optar por coletar, como data de nascimento e telefone.</li>
              <li><strong>Dados de Saúde e Atividade Física (coletados pelo Personal Trainer):</strong> Medidas corporais, histórico de saúde (anamnese), objetivos, fotos de progresso, feedback sobre treinos e dados de performance (cargas, repetições, etc.).</li>
              <li><strong>Informações de Pagamento:</strong> Processamos os pagamentos através de um parceiro (Stripe). Não armazenamos os dados completos do seu cartão de crédito em nossos servidores.</li>
              <li><strong>Dados de Uso da Plataforma:</strong> Coletamos informações sobre como você interage com o FitFlow, como funcionalidades acessadas, horários de login, e erros encontrados, para melhorar sua experiência.</li>
            </ul>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">2. Como Usamos Suas Informações</h2>
            <p>Utilizamos as informações coletadas para as seguintes finalidades:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Fornecer o Serviço Principal:</strong> Criar e gerenciar contas, permitir a elaboração de treinos, acompanhar o progresso dos alunos e facilitar a comunicação.</li>
              <li><strong>Processar Pagamentos:</strong> Gerenciar assinaturas e transações financeiras.</li>
              <li><strong>Melhorar a Plataforma:</strong> Analisar dados de uso para identificar tendências, corrigir bugs e desenvolver novas funcionalidades, incluindo nosso Assistente com IA.</li>
              <li><strong>Comunicação:</strong> Enviar e-mails importantes sobre sua conta, atualizações da plataforma, novidades e informações sobre pagamentos.</li>
              <li><strong>Segurança e Conformidade:</strong> Proteger a plataforma contra fraudes e abusos, e cumprir com nossas obrigações legais, incluindo a Lei Geral de Proteção de Dados (LGPD).</li>
            </ul>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">3. Compartilhamento de Informações</h2>
            <p>A confidencialidade dos seus dados é nossa prioridade. Não vendemos suas informações pessoais. O compartilhamento ocorre apenas nas seguintes circunstâncias:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Com o seu Personal Trainer / Aluno:</strong> A plataforma é uma ferramenta de conexão, portanto, os dados de treino e progresso de um aluno são compartilhados com seu respectivo personal trainer, e vice-versa.</li>
              <li><strong>Provedores de Serviço:</strong> Trabalhamos com empresas terceirizadas que nos ajudam a operar, como provedores de infraestrutura em nuvem (ex: Supabase, Vercel), processadores de pagamento (ex: Stripe) e ferramentas de análise. Eles só podem usar as informações para os fins contratados.</li>
              <li><strong>Obrigações Legais:</strong> Podemos divulgar informações se formos obrigados por lei ou acreditarmos que tal ação é necessária para proteger nossos direitos e a segurança de nossos usuários.</li>
            </ul>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">4. Seus Direitos como Titular dos Dados</h2>
            <p>De acordo com a LGPD, você tem o direito de:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Acessar:</strong> Solicitar o acesso aos seus dados pessoais.</li>
              <li><strong>Corrigir:</strong> Solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
              <li><strong>Anonimização ou Exclusão:</strong> Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em não conformidade com a lei. A exclusão de dados essenciais para o serviço implicará no encerramento da sua conta.</li>
              <li><strong>Portabilidade:</strong> Solicitar a portabilidade dos seus dados para outro fornecedor de serviço.</li>
              <li><strong>Revogar o Consentimento:</strong> Revogar seu consentimento a qualquer momento.</li>
            </ul>
            <p className="mt-4">Para exercer esses direitos, o personal trainer pode gerenciar grande parte dos dados diretamente na plataforma ou entrar em contato conosco. Os alunos devem contatar seu personal trainer, que é o controlador dos seus dados.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">5. Segurança dos Dados</h2>
            <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito e em repouso, controle de acesso restrito e monitoramento constante de nossa infraestrutura.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">6. Cookies e Tecnologias Semelhantes</h2>
            <p>Usamos cookies estritamente necessários para o funcionamento da plataforma, como manter sua sessão de login ativa. Não usamos cookies para fins de marketing ou rastreamento de terceiros.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">7. Alterações a esta Política</h2>
            <p>Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações significativas através de e-mail ou por um aviso na plataforma.</p>

            <h2 className="mt-12 mb-6 font-headline text-2xl border-b pb-2">8. Contato</h2>
            <p>Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco pelo e-mail: <a href="mailto:suporte@fitflow.com.br">suporte@fitflow.com.br</a>.</p>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 FitFlow. Porque ser personal trainer também é ser empresário.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/termos-de-uso" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Termos de Uso
          </Link>
          <Link href="/politica-de-privacidade" className="text-xs hover:underline underline-offset-4" prefetch={false}>
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
