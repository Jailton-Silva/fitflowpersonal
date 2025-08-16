import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Users, Calendar, BarChart, CheckCircle, ShieldCheck, Cpu, Smartphone } from "lucide-react";
import Image from "next/image";
import LandingPageHeader from "@/components/layout/landing-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingPageHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                   <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">
                    A plataforma de gestão para Personal Trainers de verdade 🏋️‍♂️
                  </div>
                  <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Sua nova central de comando para treinos de excelência
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    FitFlow é a plataforma SaaS definitiva para personal trainers que querem sair das planilhas e dominar a gestão de alunos com eficiência, profissionalismo e praticidade.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild className="ripple">
                    <Link href="/signup" prefetch={false}>
                      Cadastre-se e teste grátis por 7 dias
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Personal trainer usando a plataforma FitFlow"
                data-ai-hint="fitness technology"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              />
            </div>
          </div>
        </section>
        
        <section id="for-who" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Para quem é o FitFlow?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Criamos uma solução focada nas necessidades de profissionais de educação física que buscam crescimento e organização.
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-2 pt-8">
                  <div className="flex items-start gap-4">
                      <CheckCircle className="mt-1 h-6 w-6 text-primary" />
                      <div>
                          <h3 className="text-lg font-bold font-headline text-left">Personal trainer autônomo</h3>
                          <p className="text-sm text-muted-foreground text-left">Que quer profissionalizar sua atuação e entregar mais valor.</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <CheckCircle className="mt-1 h-6 w-6 text-primary" />
                      <div>
                          <h3 className="text-lg font-bold font-headline text-left">Instrutores e Coaches</h3>
                          <p className="text-sm text-muted-foreground text-left">Que precisam organizar seus treinos e monitorar o progresso real dos alunos.</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <CheckCircle className="mt-1 h-6 w-6 text-primary" />
                      <div>
                          <h3 className="text-lg font-bold font-headline text-left">Treinadores online</h3>
                          <p className="text-sm text-muted-foreground text-left">Que buscam escalar seus atendimentos com uma ferramenta tecnológica robusta.</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <CheckCircle className="mt-1 h-6 w-6 text-primary" />
                      <div>
                          <h3 className="text-lg font-bold font-headline text-left">Donos de estúdio</h3>
                          <p className="text-sm text-muted-foreground text-left">Que desejam padronizar o atendimento e gerenciar múltiplos treinadores.</p>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                 <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">Funcionalidades</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">O que você faz com o FitFlow?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Tudo o que você precisa para entregar treinos de excelência, monitorar a evolução e ampliar seus resultados — em um só lugar.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-sm items-start gap-8 sm:max-w-none sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Users className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">Gestão de Alunos</h3>
                  <p className="text-muted-foreground text-sm">
                    Cadastre e acompanhe seus alunos com histórico completo, medidas, anamnese, objetivos e evolução.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Dumbbell className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">Criação de Treinos</h3>
                  <p className="text-muted-foreground text-sm">
                    Crie treinos com nossa biblioteca de exercícios, configure séries, repetições e vídeos explicativos.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <BarChart className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">Acompanhamento de Progresso</h3>
                  <p className="text-muted-foreground text-sm">
                    Gráficos de evolução, fotos comparativas e relatórios automáticos. Mostre resultados com dados reais.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Calendar className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">Agendamento Inteligente</h3>
                  <p className="text-muted-foreground text-sm">
                    Sua agenda organizada, com notificações automáticas para os alunos e controle de presença.
                  </p>
                </CardContent>
              </Card>
               <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Smartphone className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">App para seus Alunos</h3>
                  <p className="text-muted-foreground text-sm">
                    Seu aluno recebe o treino, marca execuções e acompanha sua evolução direto do celular (PWA).
                  </p>
                </CardContent>
              </Card>
               <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Cpu className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">Assistente com IA</h3>
                  <p className="text-muted-foreground text-sm">
                    Receba sugestões de exercícios baseadas nos dados e objetivos do aluno para criar planos mais eficazes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-3">
                        <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm font-semibold">Planos</div>
                        <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Planos sob medida para seu crescimento</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                           Sem fidelidade, sem taxa de adesão. Cancele quando quiser.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-md items-stretch gap-8 sm:max-w-none sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
                    <Card className="flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-2xl">Start</CardTitle>
                            <p className="text-sm text-muted-foreground">Ideal para iniciantes</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                           <p className="text-4xl font-bold">R$29<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                           <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Até 20 alunos ativos</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Criação de treinos ilimitada</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Agenda e app para alunos</li>
                           </ul>
                        </CardContent>
                        <div className="p-6 pt-0"><Button variant="outline" className="w-full">Escolher Plano</Button></div>
                    </Card>
                     <Card className="flex flex-col border-2 border-primary shadow-lg relative">
                        <div className="absolute -top-4 right-4 inline-block rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">Popular</div>
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-2xl">Pro</CardTitle>
                             <p className="text-sm text-muted-foreground">Para personais em expansão</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                             <p className="text-4xl font-bold">R$59<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Até 100 alunos ativos</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Tudo do plano Start</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Assistente IA de exercícios</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Relatórios avançados</li>
                           </ul>
                        </CardContent>
                        <div className="p-6 pt-0"><Button className="w-full ripple">Escolher Plano</Button></div>
                    </Card>
                     <Card className="flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-2xl">Elite</CardTitle>
                            <p className="text-sm text-muted-foreground">Para top performers e estúdios</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                           <p className="text-4xl font-bold">R$99<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Alunos ilimitados</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Tudo do plano Pro</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Marca branca no app</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Múltiplos treinadores</li>
                           </ul>
                        </CardContent>
                        <div className="p-6 pt-0"><Button variant="outline" className="w-full">Escolher Plano</Button></div>
                    </Card>
                </div>
            </div>
        </section>
        
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Dúvidas Frequentes (FAQ)</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Respostas diretas para as perguntas mais comuns sobre o FitFlow.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl pt-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>O FitFlow oferece período de teste?</AccordionTrigger>
                  <AccordionContent>
                    Sim! Você pode testar todas as funcionalidades do plano Pro gratuitamente por 7 dias, sem compromisso e sem precisar cadastrar um cartão de crédito.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como funciona o app para o aluno?</AccordionTrigger>
                  <AccordionContent>
                    Seu aluno acessa o FitFlow através de um link exclusivo, como um portal. Funciona como um aplicativo (PWA) que ele pode adicionar à tela inicial do celular, sem precisar baixar nada da App Store ou Google Play. Lá ele visualiza os treinos, marca como concluído e acompanha o próprio progresso.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Posso cancelar minha assinatura a qualquer momento?</AccordionTrigger>
                  <AccordionContent>
                    Com certeza. O FitFlow não tem contrato de fidelidade. Você pode cancelar sua assinatura quando quiser, diretamente no seu painel de configurações, sem burocracia.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Meus dados e os dados dos meus alunos estão seguros?</AccordionTrigger>
                  <AccordionContent>
                    Totalmente. Levamos a segurança e a privacidade a sério. Utilizamos as melhores práticas de segurança do mercado e estamos em conformidade com a LGPD. Seus dados são seus e você tem total controle sobre eles.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-5">
                  <AccordionTrigger>Preciso ter conhecimento técnico para usar a plataforma?</AccordionTrigger>
                  <AccordionContent>
                    Não. O FitFlow foi desenhado para ser intuitivo e fácil de usar, mesmo para quem não tem familiaridade com tecnologia. Nosso objetivo é que você gaste seu tempo com o que realmente importa: seus alunos.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <section id="tech" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Tecnologia pensada para escalar com você</h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Nossa infraestrutura é moderna, segura e pronta para o crescimento do seu negócio.
                    </p>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-3 mt-8">
                     <div className="flex flex-col items-center gap-2">
                         <ShieldCheck className="h-10 w-10 text-primary" />
                         <h3 className="font-bold">Dados Seguros</h3>
                         <p className="text-sm text-muted-foreground">Em conformidade com a LGPD, seus dados e de seus alunos estão protegidos.</p>
                     </div>
                      <div className="flex flex-col items-center gap-2">
                         <Smartphone className="h-10 w-10 text-primary" />
                         <h3 className="font-bold">App para Alunos</h3>
                         <p className="text-sm text-muted-foreground">Uma Progressive Web App (PWA) leve e acessível de qualquer celular.</p>
                     </div>
                      <div className="flex flex-col items-center gap-2">
                         <Cpu className="h-10 w-10 text-primary" />
                         <h3 className="font-bold">Nuvem e IA</h3>
                         <p className="text-sm text-muted-foreground">Acessível de qualquer dispositivo com a mais nova tecnologia de IA generativa.</p>
                     </div>
                </div>
            </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl font-headline">Comece a transformar sua carreira agora.</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Chegou o momento de sair da improvisação. Com o FitFlow, você oferece uma experiência premium, ganha tempo e impulsiona seus resultados.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button size="lg" asChild className="w-full ripple">
                <Link href="/signup" prefetch={false}>
                  Cadastre-se agora e teste grátis por 7 dias
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Sem compromisso. Sem cartão de crédito. Com total liberdade.
              </p>
            </div>
          </div>
        </section>
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
           <Link href="#faq" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Dúvidas? (FAQ)
          </Link>
        </nav>
      </footer>
    </div>
  );
}
