import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Users, Calendar, BarChart, CheckCircle } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="sr-only">FitFlow</span>
        </Link>
        <h1 className="ml-2 text-2xl font-headline font-bold text-primary">FitFlow</h1>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Entrar
          </Link>
          <Button asChild>
            <Link href="/signup" prefetch={false}>
              Cadastre-se
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Eleve o Nível do seu Trabalho como Personal Trainer
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    FitFlow é a plataforma completa para gerenciar seus alunos, criar planos de treino personalizados e acompanhar o progresso de forma profissional.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup" prefetch={false}>
                      Comece Gratuitamente
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Personal trainer auxiliando aluna"
                data-ai-hint="personal trainer"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">Funcionalidades Principais</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Tudo que Você Precisa para o Sucesso</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  FitFlow oferece um conjunto completo de ferramentas para otimizar sua consultoria de treinamento físico.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Users className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">Gestão de Alunos</h3>
                  <p className="text-muted-foreground">
                    Mantenha registros detalhados dos seus clientes, desde medidas até fotos de progresso e feedback.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Dumbbell className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">Criação de Treinos</h3>
                  <p className="text-muted-foreground">
                    Construa programas de treinamento personalizados com nossa vasta biblioteca de exercícios.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Calendar className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold font-headline">Agendamento Inteligente</h3>
                  <p className="text-muted-foreground">
                    Gerencie seus compromissos e sessões com um calendário intuitivo e integrado.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Planos</div>
                        <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Escolha o Plano Ideal para Você</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Planos flexíveis que crescem com o seu negócio. Comece hoje mesmo.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline">Iniciante</CardTitle>
                            <p className="text-4xl font-bold">R$29<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                           <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Até 10 alunos ativos</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Criação de treinos ilimitada</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />App para alunos (PWA)</li>
                           </ul>
                        </CardContent>
                        <div className="p-6 pt-0"><Button className="w-full">Escolher Plano</Button></div>
                    </Card>
                     <Card className="flex flex-col border-primary shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="font-headline">Profissional</CardTitle>
                                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Popular</div>
                            </div>
                            <p className="text-4xl font-bold">R$59<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Até 50 alunos ativos</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Tudo do plano Iniciante</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Assistente IA de exercícios</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Suporte prioritário</li>
                           </ul>
                        </CardContent>
                        <div className="p-6 pt-0"><Button className="w-full">Escolher Plano</Button></div>
                    </Card>
                     <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline">Studio</CardTitle>
                            <p className="text-4xl font-bold">R$99<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Alunos ilimitados</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Tudo do plano Profissional</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Múltiplos treinadores</li>
                                <li className="flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5" />Marca branca no app</li>
                           </ul>
                        </CardContent>
                        <div className="p-6 pt-0"><Button className="w-full">Escolher Plano</Button></div>
                    </Card>
                </div>
            </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 FitFlow. Todos os direitos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Termos de Serviço
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  );
}
