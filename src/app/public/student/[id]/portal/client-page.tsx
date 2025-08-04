
"use client";

import { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, History, Ruler, Weight, Phone, Edit, Calendar, Trophy, User } from "lucide-react";
import Link from "next/link";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    const [workoutsFilter, setWorkoutsFilter] = useState<{ status?: string }>({});
    const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({});
    const [sessionsFilter, setSessionsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });

    const [lastActivity, setLastActivity] = useState<string | null>(null);

    useEffect(() => {
        if (initialSessions && initialSessions.length > 0) {
            const mostRecentSession = initialSessions.reduce((latest, current) => {
                const latestDate = new Date(latest.completed_at || latest.started_at);
                const currentDate = new Date(current.completed_at || current.started_at);
                return currentDate > latestDate ? current : latest;
            });
            const lastDate = mostRecentSession.completed_at || mostRecentSession.started_at;
            setLastActivity(format(new Date(lastDate), "'Última atividade em' dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
        }
    }, [initialSessions]);

    const filteredWorkouts = useMemo(() => {
        return initialWorkouts.filter(w => {
            const statusMatch = !workoutsFilter.status || workoutsFilter.status === 'all' || w.status === workoutsFilter.status;
            return statusMatch;
        });
    }, [initialWorkouts, workoutsFilter]);

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23,59,59,999)) : null;

        return initialMeasurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [initialMeasurements, measurementsFilter]);

    const filteredSessions = useMemo(() => {
        const fromDate = sessionsFilter.range?.from ? new Date(sessionsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = sessionsFilter.range?.to ? new Date(sessionsFilter.range.to.setHours(23,59,59,999)) : null;
        const lowerCaseFilter = sessionsFilter.text.toLowerCase();

        return initialSessions
            .filter(s => {
                const itemDate = parseISO(s.started_at);
                const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
                const textMatch = !lowerCaseFilter || s.workouts?.name.toLowerCase().includes(lowerCaseFilter);
                return dateMatch && textMatch;
            });
    }, [initialSessions, sessionsFilter]);

    const statusMap: {[key: string]: {text: string, variant: "default" | "secondary" | "destructive" | "outline" | "success"}} = {
        'active': {text: 'Ativo', variant: 'success'},
        'not-started': {text: 'Não Iniciado', variant: 'secondary'},
        'completed': {text: 'Concluído', variant: 'default'},
    }
    
    return (
        <div className="space-y-6">
             <header className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-3xl">
                        {student.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                        <Badge variant={student.status === "active" ? "success" : "secondary"}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{student.email}</p>
                    {lastActivity && <p className="text-sm text-muted-foreground">{lastActivity}</p>}
                </div>
            </header>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Treinos</CardTitle>
                        <Select onValueChange={(value) => setWorkoutsFilter({ status: value })}>
                            <SelectTrigger className="w-full sm:w-[200px] h-9">
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
                                       <Button variant="outline" size="sm" asChild>
                                            <Link href={`/public/workout/${workout.id}`}>
                                                Acessar
                                            </Link>
                                       </Button>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para os filtros selecionados.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                        <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões</CardTitle>
                        <div className="flex flex-col md:flex-row gap-2">
                             <Input 
                                placeholder="Buscar por nome do treino..."
                                value={sessionsFilter.text}
                                onChange={(e) => setSessionsFilter(prev => ({...prev, text: e.target.value}))}
                                className="h-9"
                            />
                            <DateRangeFilter
                                onDateChange={(range) => setSessionsFilter(prev => ({...prev, range}))}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent><SessionsHistory sessions={filteredSessions} /></CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle>
                        <DateRangeFilter
                            onDateChange={(range) => setMeasurementsFilter({ range })}
                        />
                    </div>
                </CardHeader>
                <CardContent><MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} /></CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                <CardContent><ProgressChart measurements={filteredMeasurements} /></CardContent>
            </Card>
        </div>
    );
}

    