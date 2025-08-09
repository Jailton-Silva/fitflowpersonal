
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Dumbbell, Calendar, Activity, Star, AlertTriangle } from "lucide-react";
import EngagementChart, { EngagementData } from "@/components/dashboard/engagement-chart";
import ProgressChart, { ProgressData } from "@/components/dashboard/progress-chart";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { subDays, startOfWeek, endOfWeek, format, parse, sub, differenceInDays } from 'date-fns';
import { Student } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import OnboardingGuide from "@/components/dashboard/onboarding-guide";

async function getDashboardData(from: string, to: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const emptyData = {
    totalStudents: 0,
    activeWorkouts: 0,
    weekAppointments: 0,
    studentsCountLastMonth: 0,
    progressData: [],
    engagementData: [],
    overallEngagementRate: 0,
    mostEngagedStudents: [],
    lowActivityStudents: [],
  };

  if (!user) {
    return emptyData;
  }
  
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!trainer) {
     return emptyData;
  }

  const trainerId = trainer.id;
  const today = new Date();
  const fromDate = parse(from, 'yyyy-MM-dd', new Date());
  const toDate = parse(to, 'yyyy-MM-dd', new Date());

  const { data: allStudents, count: totalStudents } = await supabase
    .from('students')
    .select('id, name, avatar_url, created_at', { count: 'exact' })
    .eq('trainer_id', trainerId)
    .eq('status', 'active');
  
  if (!allStudents) {
      console.error("Dashboard data error: could not fetch students");
      return emptyData;
  }

  const studentIdList = allStudents.map(s => s.id);

  if (studentIdList.length === 0) {
    return {
        ...emptyData,
        totalStudents: totalStudents ?? 0,
    };
  }

  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  const lastMonth = subDays(today, 30);
  
  // Batch all other queries
  const [
      studentsCountLastMonthResult,
      activeWorkoutsResult,
      weekAppointmentsResult,
      measurementsResult,
      appointmentsResult,
      recentSessionsResult,
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('trainer_id', trainerId).gte('created_at', lastMonth.toISOString()),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('trainer_id', trainerId),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId).gte('start_time', startOfCurrentWeek.toISOString()).lte('end_time', endOfCurrentWeek.toISOString()),
    supabase.from('measurements').select('created_at, weight, body_fat').in('student_id', studentIdList).gte('created_at', fromDate.toISOString()).lte('created_at', toDate.toISOString()).order('created_at', { ascending: true }),
    supabase.from('appointments').select('start_time, status').eq('trainer_id', trainerId).gte('start_time', fromDate.toISOString()).lte('end_time', toDate.toISOString()),
    supabase.from('workout_sessions').select('student_id, completed_at, started_at').in('student_id', studentIdList).gte('started_at', sub(new Date(), {days: 30}).toISOString()),
  ]);

  const studentsCountLastMonth = studentsCountLastMonthResult.count ?? 0;
  const activeWorkouts = activeWorkoutsResult.count ?? 0;
  const weekAppointments = weekAppointmentsResult.count ?? 0;
  const measurements = measurementsResult.data ?? [];
  const appointments = appointmentsResult.data ?? [];
  const recentSessions = recentSessionsResult.data ?? [];

  // CHART DATA
  const monthlyProgress: { [key: string]: { weights: number[], fats: number[] } } = {};
  measurements.forEach(m => {
      const month = format(new Date(m.created_at), 'yyyy-MM');
      if (!monthlyProgress[month]) {
          monthlyProgress[month] = { weights: [], fats: [] };
      }
      if(m.weight) monthlyProgress[month].weights.push(m.weight);
      if(m.body_fat) monthlyProgress[month].fats.push(m.body_fat);
  });

  const progressData: ProgressData = Object.entries(monthlyProgress).map(([month, data]) => ({
      name: format(parse(month, 'yyyy-MM', new Date()), 'MMM/yy'),
      weight: data.weights.length ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length : 0,
      bodyFat: data.fats.length ? data.fats.reduce((a, b) => a + b, 0) / data.fats.length : 0,
  }));

  // Engagement Chart
  const monthlyEngagement: { [key: string]: { scheduled: number, completed: number } } = {};
  appointments.forEach(apt => {
      const month = format(new Date(apt.start_time), 'yyyy-MM');
      if (!monthlyEngagement[month]) {
          monthlyEngagement[month] = { scheduled: 0, completed: 0 };
      }
      monthlyEngagement[month].scheduled++;
      if (apt.status === 'completed') {
          monthlyEngagement[month].completed++;
      }
  });

  const engagementData: EngagementData = Object.entries(monthlyEngagement).map(([month, data]) => ({
      month: format(parse(month, 'yyyy-MM', new Date()), 'MMM/yy'),
      completed: data.completed,
      scheduled: data.scheduled
  }));

  const scheduledTotal = engagementData.reduce((acc, curr) => acc + curr.scheduled, 0);
  const completedTotal = engagementData.reduce((acc, curr) => acc + curr.completed, 0);
  const overallEngagementRate = scheduledTotal > 0 ? (completedTotal / scheduledTotal) * 100 : 0;

  // ENGAGEMENT AND ACTIVITY LISTS
  const studentActivity: {[studentId: string]: {last_activity: string, completed_count: number}} = {};
  recentSessions.forEach(session => {
      if(!studentActivity[session.student_id]) {
          studentActivity[session.student_id] = { last_activity: session.started_at, completed_count: 0};
      }
      if(session.completed_at) {
        studentActivity[session.student_id].completed_count++;
      }
      const currentLastActivity = studentActivity[session.student_id].last_activity;
      const sessionActivityDate = session.completed_at || session.started_at;

      if (new Date(sessionActivityDate) > new Date(currentLastActivity)) {
        studentActivity[session.student_id].last_activity = sessionActivityDate;
      }
  });

  const mostEngagedStudents = allStudents
    .map(s => ({...s, completed_count: studentActivity[s.id]?.completed_count || 0}))
    .sort((a,b) => b.completed_count - a.completed_count)
    .slice(0, 3);
  
  const lowActivityStudents = allStudents
    .filter(s => {
        const lastActivityDate = studentActivity[s.id]?.last_activity;
        const studentCreationDate = new Date(s.created_at);
        // Only consider students created more than 7 days ago to avoid flagging new students
        if (differenceInDays(today, studentCreationDate) < 7) {
            return false;
        }
        if (!lastActivityDate) return true; // No activity at all
        return differenceInDays(today, new Date(lastActivityDate)) > 15;
    })
    .slice(0, 5);


  return {
    totalStudents: totalStudents ?? 0,
    activeWorkouts,
    weekAppointments,
    studentsCountLastMonth,
    progressData,
    engagementData,
    overallEngagementRate,
    mostEngagedStudents,
    lowActivityStudents,
  };
}


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const to = searchParams.to || format(new Date(), 'yyyy-MM-dd');
  const from = searchParams.from || format(subDays(new Date(), 180), 'yyyy-MM-dd'); // Default to last 6 months

  const data = await getDashboardData(from, to);
  const showOnboarding = data.totalStudents === 0;


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
                    {data.mostEngagedStudents.map((student, index) => (
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
               ): (
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
               ): (
                <p className="text-muted-foreground text-center py-4">Ótimo! Nenhum aluno com baixa atividade.</p>
               )}
            </CardContent>
 </Card>
 </div>
 </div>
  );
}
