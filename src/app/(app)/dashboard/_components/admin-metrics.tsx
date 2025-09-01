import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import EngagementChart, { type EngagementData } from "@/components/dashboard/engagement-chart";
import OnboardingGuide from "@/components/dashboard/onboarding-guide";
import ProgressChart, { type ProgressData } from "@/components/dashboard/progress-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Calendar, Dumbbell, Star, Users } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalStudents: number;
  activeWorkouts: number;
  weekAppointments: number;
  studentsCountLastMonth: number;
  progressData: ProgressData;
  engagementData: EngagementData;
  overallEngagementRate: number;
  mostEngagedStudents: any[];
  lowActivityStudents: any[];
}

interface AdminMetricsProps {
  from: string;
  to: string;
  data: DashboardData;
}

export function AdminMetrics({ from, to, data }: AdminMetricsProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <DateRangeFilter defaultFrom={from} defaultTo={to} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Treinadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">
              +{data.studentsCountLastMonth} desde o mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treinadores Ativos</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75</div>
            <p className="text-xs text-muted-foreground">Com assinatura ativa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">300</div>
            <p className="text-xs text-muted-foreground">Alunos cadastrados na plataforma</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="font-headline">Evolução de Assinaturas</CardTitle>
            <CardDescription>Progresso das assinaturas no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart data={data.progressData} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}