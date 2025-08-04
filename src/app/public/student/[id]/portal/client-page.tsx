
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Activity, Calendar, User, Check, Trophy, BookOpen } from "lucide-react";
import { parseISO, format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}


export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    
    const [workoutsFilter, setWorkoutsFilter] = useState<'all' | 'not-started' | 'active' | 'completed' | 'inactive'>('all');
    const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);

    useEffect(() => {
        if(initialSessions && initialSessions.length > 0) {
            const mostRecentSession = initialSessions.reduce((latest, current) => {
                const latestDate = new Date(latest.started_at);
                const currentDate = new Date(current.started_at);
                return currentDate > latestDate ? current : latest;
            });
            setLastActivityDate(format(new Date(mostRecentSession.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
        }
    }, [initialSessions]);

    const filteredWorkouts = useMemo(() => {
        if(workoutsFilter === 'all') return initialWorkouts;
        return initialWorkouts.filter(w => w.status === workoutsFilter);
    }, [initialWorkouts, workoutsFilter]);

    const stats = useMemo(() => {
        const completedCount = initialSessions.filter(s => s.completed_at).length;
        const totalWorkouts = initialWorkouts.length;
        const completionRate = totalWorkouts > 0 ? (completedCount / totalWorkouts) * 100 : 0;
        return { completedCount, completionRate };
    }, [initialSessions, initialWorkouts]);

    const statusMap: {[key: string]: {text: string, variant: "default" | "secondary" | "destructive" | "outline" | "success"}} = {
        'active': {text: 'Ativo', variant: 'success'},
        'not-started': {text: 'Não Iniciado', variant: 'secondary'},
        'completed': {text: 'Concluído', variant: 'default'},
        'inactive': {text: 'Inativo', variant: 'outline'},
    }


    return (
      <div className="space-y-6 px-[10px]">
         <header className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Avatar className="w-20 h-20 border-2 border-primary">
                <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                <AvatarFallback className="text-2xl">{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm text-muted-foreground">Bem-vindo(a) de volta,</p>
                <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                   <Calendar className="h-4 w-4" />
                   Última atividade: {lastActivityDate || "Nenhuma atividade ainda"}
                </p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Treinos Concluídos</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.completedCount}</div>
                    <p className="text-xs text-muted-foreground">Total de sessões finalizadas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{initialWorkouts.filter(w => w.status === 'active' || w.status === 'not-started').length}</div>
                    <p className="text-xs text-muted-foreground">Prontos para executar</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                    <Check className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
                     <p className="text-xs text-muted-foreground">Dos treinos atribuídos</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
                 <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                             <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/>Meus Treinos</CardTitle>
                             <Select onValueChange={(value: 'all' | 'not-started' | 'active' | 'completed' | 'inactive') => setWorkoutsFilter(value)} value={workoutsFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filtrar por status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="not-started">Não Iniciado</SelectItem>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="completed">Concluído</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                       {filteredWorkouts.length > 0 ? (
                           <ul className="space-y-3">
                               {filteredWorkouts.map((workout: Workout) => (
                                   <li key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                       <div>
                                           <p className="font-semibold">{workout.name}</p>
                                           <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                       </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusMap[workout.status]?.variant || 'secondary'}>
                                              {statusMap[workout.status]?.text || 'Desconhecido'}
                                            </Badge>
                                           <Button variant="default" size="sm" asChild disabled={workout.status === 'inactive' || workout.status === 'completed'}>
                                                <Link href={`/public/workout/${workout.id}`}>
                                                    {initialSessions.some(s => s.workout_id === workout.id && !s.completed_at) ? 'Continuar' : 'Ver Treino'}
                                                </Link>
                                           </Button>
                                       </div>
                                   </li>
                               ))}
                           </ul>
                       ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para este filtro.</p>}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><BookOpen className="mr-2"/> Histórico de Sessões</CardTitle></CardHeader>
                    <CardContent>
                        <SessionsHistory sessions={initialSessions} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Minhas Medições</CardTitle></CardHeader>
                    <CardContent>
                        <MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProgressChart measurements={initialMeasurements} />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    );
}
