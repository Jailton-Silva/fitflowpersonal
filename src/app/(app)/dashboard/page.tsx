import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Dumbbell, Calendar, Activity, Star, AlertTriangle } from "lucide-react";
import EngagementChart from "@/components/dashboard/engagement-chart";
import ProgressChart from "@/components/dashboard/progress-chart";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { subDays, format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import OnboardingGuide from "@/components/dashboard/onboarding-guide";
import { getDashboardData } from "@/actions/get-dashboard-data";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const to = searchParams.to || format(new Date(), 'yyyy-MM-dd');
  const from = searchParams.from || format(subDays(new Date(), 180), 'yyyy-MM-dd'); // Default to last 6 months

  const data = await getDashboardData({
    from,
    to,
  });

  const showOnboarding = data!.totalStudents === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>

      {showOnboarding && <OnboardingGuide />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +{data.studentsCountLastMonth} desde o mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treinos Ativos</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeWorkouts}</div>
            <p className="text-xs text-muted-foreground">Atribuídos aos alunos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas da Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.weekAppointments}</div>
            <p className="text-xs text-muted-foreground">Agendadas para esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Geral</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overallEngagementRate?.toFixed(0) ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">Taxa de conclusão de treinos</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Evolução Física Média</CardTitle>
            <CardDescription>Progresso médio dos alunos no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart data={data.progressData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Engajamento dos Alunos</CardTitle>
            <CardDescription>Treinos concluídos vs. agendados no período.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <EngagementChart data={data.engagementData} />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Star className="text-yellow-500" /> Alunos Mais Engajados</CardTitle>
            <CardDescription>Top 3 alunos com mais treinos concluídos nos últimos 30 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.mostEngagedStudents.length > 0 ? (
              <ul className="space-y-4">
                {data.mostEngagedStudents.map((student) => (
                  <li key={student.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link href={`/students/${student.id}`} className="font-semibold hover:underline">{student.name}</Link>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{student.completed_count}</div>
                      <div className="text-xs text-muted-foreground">treinos</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum dado de engajamento ainda.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle className="text-orange-500" /> Alunos com Baixa Atividade</CardTitle>
            <CardDescription>Alunos sem treinos registrados há mais de 15 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowActivityStudents.length > 0 ? (
              <ul className="space-y-4">
                {data.lowActivityStudents.map((student) => (
                  <li key={student.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link href={`/students/${student.id}`} className="font-semibold hover:underline">{student.name}</Link>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/students/${student.id}`}>Ver Perfil</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/workouts/new?student_id=${student.id}`}>Criar Treino</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Ótimo! Nenhum aluno com baixa atividade.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
