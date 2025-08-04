
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Dumbbell, Calendar as CalendarIcon, History, User, Trophy } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory, { FormattedSession } from "@/components/students/sessions-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}


export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    
    const [workouts, setWorkouts] = useState(initialWorkouts);
    const [statusFilter, setStatusFilter] = useState('all');
    const [lastActivityDate, setLastActivityDate] = useState("Carregando...");

     useEffect(() => {
        if (initialSessions.length > 0) {
            const mostRecentSession = [...initialSessions].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
            const dateToFormat = mostRecentSession.completed_at ? mostRecentSession.completed_at : mostRecentSession.started_at;
            setLastActivityDate(format(new Date(dateToFormat), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
        } else {
            setLastActivityDate("Nenhuma atividade registrada");
        }
    }, [initialSessions]);


    const getWorkoutStatus = (workout: Workout) => {
        const sessionHistory = initialSessions.filter(s => s.workout_id === workout.id);
        if (workout.status === 'completed') return { text: 'Concluído', variant: 'default' };
        if (workout.status === 'inactive') return { text: 'Inativo', variant: 'outline' };
        if (sessionHistory.length === 0) return { text: 'Não Iniciado', variant: 'secondary' };
        if (sessionHistory.some(s => !s.completed_at)) return { text: 'Ativo', variant: 'success' };
        return { text: 'Não Iniciado', variant: 'secondary' };
    };

    const filteredWorkouts = useMemo(() => {
        if (statusFilter === 'all') {
            return initialWorkouts;
        }
        return initialWorkouts.filter(w => {
            const status = getWorkoutStatus(w);
            if (statusFilter === 'not-started') return status.text === 'Não Iniciado';
            if (statusFilter === 'active') return status.text === 'Ativo';
            if (statusFilter === 'completed') return status.text === 'Concluído';
            return false;
        });
    }, [initialWorkouts, statusFilter, initialSessions]);

    const statusMap: {[key: string]: {text: string, variant: "default" | "secondary" | "destructive" | "outline" | "success"}} = {
        'active': {text: 'Ativo', variant: 'success'},
        'not-started': {text: 'Não Iniciado', variant: 'secondary'},
        'completed': {text: 'Concluído', variant: 'default'},
        'inactive': {text: 'Inativo', variant: 'outline'},
    }


    const formattedSessions: FormattedSession[] = useMemo(() => {
        return initialSessions.map(session => ({
            ...session,
            formattedDate: format(new Date(session.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
        }));
    }, [initialSessions]);

    // Renders the page content
    return (
        <div className="space-y-6 px-[10px]">
            <header className="flex flex-col sm:flex-row gap-6 items-start">
                 <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-3xl">
                        {student.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-bold font-headline">Bem-vindo(a), {student.name.split(' ')[0]}!</h1>
                     <p className="text-muted-foreground">Este é o seu portal pessoal. Acompanhe seus treinos, medições e evolução.</p>
                     <div className="flex items-center text-sm text-muted-foreground pt-1">
                           <Activity className="mr-2 h-4 w-4" />
                            <span>Última atividade: {lastActivityDate}</span>
                        </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Treinos</CardTitle>
                         <div className="pt-2">
                            <Select onValueChange={setStatusFilter} defaultValue="all">
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Filtrar por status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="not-started">Não Iniciado</SelectItem>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="completed">Concluído</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                       {filteredWorkouts.length > 0 ? (
                           <ul className="max-h-64 overflow-y-auto space-y-3 pr-2">
                               {filteredWorkouts.map((workout: Workout) => {
                                   const status = getWorkoutStatus(workout);
                                   const isClickable = workout.status !== 'inactive' && workout.status !== 'completed';
                                   return (
                                       <li key={workout.id}>
                                            <Link href={isClickable ? `/public/workout/${workout.id}` : '#'} className={cn("block", !isClickable && "pointer-events-none")}>
                                               <div className={cn("flex items-center justify-between p-3 bg-muted/50 rounded-lg", isClickable && "hover:bg-muted")}>
                                                   <div>
                                                       <p className="font-semibold">{workout.name}</p>
                                                       <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                                   </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={status.variant as any}>
                                                          {status.text}
                                                        </Badge>
                                                   </div>
                                               </div>
                                           </Link>
                                       </li>
                                   )
                               })}
                           </ul>
                       ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para os filtros selecionados.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões</CardTitle>
                         <CardDescription>Sessões de treino que você já iniciou.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <SessionsHistory sessions={formattedSessions} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Trophy className="mr-2"/> Minhas Medições</CardTitle>
                        <CardDescription>Acompanhe seu progresso físico ao longo do tempo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} />
                    </CardContent>
                </Card>

                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProgressChart measurements={initialMeasurements} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
