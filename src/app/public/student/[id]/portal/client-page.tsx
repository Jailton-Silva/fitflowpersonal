
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, Dumbbell, Trophy, User, History } from "lucide-react";
import { parseISO, format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MeasurementsHistory from "@/components/students/measurements-history";
import ProgressChart from "@/components/students/progress-chart";
import SessionsHistory from "@/components/students/sessions-history";
import { cn } from "@/lib/utils";


type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

const statusVariantMap: { [key: string]: { text: string; variant: "default" | "secondary" | "destructive" | "outline" | "success", bgColor: string } } = {
    'completed': { text: 'Concluído', variant: 'default', bgColor: 'bg-green-500/10' },
    'active': { text: 'Ativo', variant: 'success', bgColor: 'bg-blue-500/10' },
    'not-started': { text: 'Não Iniciado', variant: 'secondary', bgColor: 'bg-gray-500/10' },
    'inactive': { text: 'Arquivado', variant: 'outline', bgColor: 'bg-gray-500/10' },
};


export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    const [workouts, setWorkouts] = useState(initialWorkouts);
    const [statusFilter, setStatusFilter] = useState('all');
    const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);

    useEffect(() => {
        const filtered = initialWorkouts.filter(w => {
            if (statusFilter === 'all') return true;
            
            const sessionHistory = initialSessions.filter(s => s.workout_id === w.id);
            const hasActiveSession = sessionHistory.some(s => !s.completed_at);
            
            let status: Workout['status'] = w.status;
            if (status === 'active' && hasActiveSession) {
                // remains active
            } else if (status === 'active' && !sessionHistory.length) {
                status = 'not-started';
            }

            return status === statusFilter;
        });
        setWorkouts(filtered);

    }, [statusFilter, initialWorkouts, initialSessions]);

    useEffect(() => {
        if (initialSessions.length > 0) {
            const mostRecentSession = initialSessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
            const dateToFormat = mostRecentSession.completed_at || mostRecentSession.started_at;
            setLastActivityDate(format(new Date(dateToFormat), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
        }
    }, [initialSessions]);

    const getWorkoutStatus = (workout: Workout) => {
        if (workout.status === 'completed' || workout.status === 'inactive') {
            return statusVariantMap[workout.status];
        }
        
        const sessionHistory = initialSessions.filter(s => s.workout_id === workout.id);
        if (sessionHistory.length === 0) {
            return statusVariantMap['not-started'];
        }

        const hasActiveSession = sessionHistory.some(s => !s.completed_at);
        if (hasActiveSession) {
             return statusVariantMap['active'];
        }
        
        return statusVariantMap['active']; // Default to active if sessions exist but all are completed
    }

    const age = student.birth_date ? differenceInDays(new Date(), new Date(student.birth_date)) : 'N/A';
    
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
                    <p className="text-sm text-muted-foreground">Bem-vindo(a) de volta,</p>
                    <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                     <div className="flex items-center text-sm text-muted-foreground pt-1">
                        <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>Último treino: {lastActivityDate || 'Nenhum treino iniciado'}</span>
                    </div>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Treinos</CardTitle>
                             <Select onValueChange={setStatusFilter} value={statusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filtrar por status" />
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
                       {workouts.length > 0 ? (
                           <ul className="space-y-3">
                               {workouts.map((workout: Workout) => {
                                    const workoutStatus = getWorkoutStatus(workout);
                                    const isClickable = workout.status !== 'inactive' && workout.status !== 'completed';
                                    
                                    const content = (
                                        <li key={workout.id} className={cn("flex items-center justify-between p-3 rounded-lg", workoutStatus.bgColor)}>
                                           <div>
                                               <p className="font-semibold">{workout.name}</p>
                                               <Badge variant={workoutStatus.variant} className="mt-1">{workoutStatus.text}</Badge>
                                           </div>
                                           {isClickable ? (
                                                <Button variant="default" size="sm" asChild>
                                                    <div>Ver Treino</div>
                                                </Button>
                                           ) : (
                                                <Button variant="outline" size="sm" disabled>Ver Treino</Button>
                                           )}
                                       </li>
                                    )
                                    
                                    if(isClickable) {
                                        return <Link href={`/public/workout/${workout.id}`} key={workout.id}>{content}</Link>
                                    }
                                    return content;
                               })}
                           </ul>
                       ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para os filtros selecionados.</p>}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SessionsHistory sessions={initialSessions.map(s => ({...s, formattedDate: format(new Date(s.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) }))} />
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
