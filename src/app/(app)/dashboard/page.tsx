import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Dumbbell, Calendar, Activity } from "lucide-react";
import EngagementChart, { EngagementData } from "@/components/dashboard/engagement-chart";
import ProgressChart, { ProgressData } from "@/components/dashboard/progress-chart";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { subDays, startOfWeek, endOfWeek, format, parse } from 'date-fns';

async function getDashboardData(from: string, to: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalStudents: 0,
      activeWorkouts: 0,
      weekAppointments: 0,
      studentsCountLastMonth: 0,
      progressData: [],
      engagementData: []
    };
  }
  
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!trainer) {
     return {
      totalStudents: 0,
      activeWorkouts: 0,
      weekAppointments: 0,
      studentsCountLastMonth: 0,
      progressData: [],
      engagementData: []
    };
  }

  const trainerId = trainer.id;
  const today = new Date();
  const lastMonth = subDays(today, 30);
  const fromDate = parse(from, 'yyyy-MM-dd', new Date());
  const toDate = parse(to, 'yyyy-MM-dd', new Date());

  // STATS
  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .eq('status', 'active');

  const { count: studentsCountLastMonth } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .gte('created_at', lastMonth.toISOString());

  const { count: activeWorkouts } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId);

  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

  const { count: weekAppointments } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .gte('start_time', startOfCurrentWeek.toISOString())
    .lte('end_time', endOfCurrentWeek.toISOString());


  // CHART DATA
  // Progress Chart
  const { data: studentIds } = await supabase.from('students').select('id').eq('trainer_id', trainerId);
  const studentIdList = studentIds?.map(s => s.id) || [];

  const { data: measurements } = await supabase
    .from('measurements')
    .select('created_at, weight, body_fat')
    .in('student_id', studentIdList)
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString())
    .order('created_at', { ascending: true });

  const monthlyProgress: { [key: string]: { weights: number[], fats: number[] } } = {};
  (measurements || []).forEach(m => {
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
  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, status')
    .eq('trainer_id', trainerId)
    .gte('start_time', fromDate.toISOString())
    .lte('end_time', toDate.toISOString());

  const monthlyEngagement: { [key: string]: { scheduled: number, completed: number } } = {};
  (appointments || []).forEach(apt => {
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

  return {
    totalStudents: totalStudents ?? 0,
    activeWorkouts: activeWorkouts ?? 0,
    weekAppointments: weekAppointments ?? 0,
    studentsCountLastMonth: studentsCountLastMonth ?? 0,
    progressData,
    engagementData
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>
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
                {
                    data.engagementData.reduce((acc, curr) => acc + curr.completed, 0) / 
                    (data.engagementData.reduce((acc, curr) => acc + curr.scheduled, 0) || 1) * 100
                }%
             </div>
            <p className="text-xs text-muted-foreground">Treinos concluídos vs. agendados</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Evolução Física Média</CardTitle>
            <CardDescription>Progresso médio dos alunos no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart data={data.progressData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Engajamento dos Alunos</CardTitle>
            <CardDescription>Treinos concluídos vs. agendados no período.</CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart data={data.engagementData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
