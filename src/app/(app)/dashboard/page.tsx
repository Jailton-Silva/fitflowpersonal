import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Dumbbell, Calendar, Activity } from "lucide-react";
import EngagementChart from "@/components/dashboard/engagement-chart";
import ProgressChart from "@/components/dashboard/progress-chart";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { subDays, startOfWeek, endOfWeek, format } from 'date-fns';

async function getDashboardStats(from: string, to: string) {
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
    };
  }

  const trainerId = trainer.id;
  const today = new Date();
  const lastMonth = subDays(today, 30);

  // Total de alunos ativos
  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .eq('status', 'active');

  // Alunos novos no último mês
  const { count: studentsCountLastMonth } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .gte('created_at', lastMonth.toISOString());

  // Treinos ativos (vamos considerar todos os treinos por enquanto)
  const { count: activeWorkouts } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId);

  // Agendamentos da semana
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

  const { count: weekAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .gte('start_time', startOfCurrentWeek.toISOString())
    .lte('end_time', endOfCurrentWeek.toISOString());

  return {
    totalStudents: totalStudents ?? 0,
    activeWorkouts: activeWorkouts ?? 0,
    weekAppointments: weekAppointments ?? 0,
    studentsCountLastMonth: studentsCountLastMonth ?? 0,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const from = searchParams.from ? format(new Date(searchParams.from), 'yyyy-MM-dd') : format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const to = searchParams.to ? format(new Date(searchParams.to), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const stats = await getDashboardStats(from, to);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <DateRangeFilter />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.studentsCountLastMonth} desde o mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treinos Ativos</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkouts}</div>
            <p className="text-xs text-muted-foreground">Atribuídos aos alunos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas da Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekAppointments}</div>
            <p className="text-xs text-muted-foreground">Agendadas para esta semana</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Evolução Física</CardTitle>
            <CardDescription>Progresso médio dos alunos nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Engajamento dos Alunos</CardTitle>
            <CardDescription>Treinos concluídos vs. agendados.</CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
