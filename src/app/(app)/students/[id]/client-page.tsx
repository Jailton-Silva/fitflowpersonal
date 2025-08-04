
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, History, PlusCircle } from "lucide-react";
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementForm from "@/components/students/measurement-form";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory, { FormattedSession } from "@/components/students/sessions-history";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentDetailClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}


export default function StudentDetailClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentDetailClientProps) {
    
    const [sessions, setSessions] = useState<FormattedSession[]>([]);

    // Filter states
    const [measurementsFilter, setMeasurementsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });
    const [workoutsFilter, setWorkoutsFilter] = useState<{ range?: DateRange; status?: string }>({});
    const [sessionsFilter, setSessionsFilter] = useState<{ text: string; range?: DateRange, status?: 'all' | 'completed' | 'in-progress' }>({ text: "", status: 'all' });

    useEffect(() => {
        const formattedSessions = initialSessions.map(session => ({
            ...session,
            formattedDate: format(new Date(session.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
        }));
        setSessions(formattedSessions);
    }, [initialSessions]);


    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23,59,59,999)) : null;
        const lowerCaseFilter = measurementsFilter.text.toLowerCase();

        return initialMeasurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            const textMatch = !lowerCaseFilter || (m.notes?.toLowerCase().includes(lowerCaseFilter));
            return dateMatch && textMatch;
        });
    }, [initialMeasurements, measurementsFilter]);
    
    const filteredWorkouts = useMemo(() => {
        const fromDate = workoutsFilter.range?.from ? new Date(workoutsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = workoutsFilter.range?.to ? new Date(workoutsFilter.range.to.setHours(23,59,59,999)) : null;

        return initialWorkouts.filter(w => {
            const itemDate = parseISO(w.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            const statusMatch = !workoutsFilter.status || workoutsFilter.status === 'all' || w.status === workoutsFilter.status;
            return dateMatch && statusMatch;
        });
    }, [initialWorkouts, workoutsFilter]);

    const filteredSessions = useMemo(() => {
        const fromDate = sessionsFilter.range?.from ? new Date(sessionsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = sessionsFilter.range?.to ? new Date(sessionsFilter.range.to.setHours(23,59,59,999)) : null;
        const lowerCaseFilter = sessionsFilter.text.toLowerCase();

        return sessions
            .filter(s => {
                const itemDate = parseISO(s.started_at);
                const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
                const textMatch = !lowerCaseFilter || s.workouts?.name.toLowerCase().includes(lowerCaseFilter);
                
                const statusMatch = sessionsFilter.status === 'all' || 
                                    (sessionsFilter.status === 'completed' && s.completed_at) ||
                                    (sessionsFilter.status === 'in-progress' && !s.completed_at);

                return dateMatch && textMatch && statusMatch;
            });
    }, [sessions, sessionsFilter]);
    
    const statusMap: {[key: string]: {text: string, variant: "default" | "secondary" | "destructive" | "outline" | "success"}} = {
        'active': {text: 'Ativo', variant: 'success'},
        'not-started': {text: 'Não Iniciado', variant: 'secondary'},
        'completed': {text: 'Concluído', variant: 'default'},
        'inactive': {text: 'Inativo', variant: 'outline'},
    }

    // Renders the page content
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle>
                        <MeasurementForm studentId={student.id}>
                            <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" />Nova Medição</Button>
                        </MeasurementForm>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 pt-2">
                        <Input 
                            placeholder="Buscar por notas..."
                            value={measurementsFilter.text}
                            onChange={(e) => setMeasurementsFilter(prev => ({...prev, text: e.target.value}))}
                            className="h-9"
                        />
                        <DateRangeFilter
                            onDateChange={(range) => setMeasurementsFilter(prev => ({...prev, range}))}
                        />
                    </div>
                </CardHeader>
                <CardContent><MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} /></CardContent>
            </Card>
            <Card>
                <CardHeader>
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <CardTitle className="text-lg font-headline flex items-center"><CalendarIcon className="mr-2"/> Planos de Treino</CardTitle>
                        <Button size="sm" variant="outline" asChild>
                           <Link href={`/workouts/new?student_id=${student.id}`}>
                               <PlusCircle className="mr-2 h-4 w-4" />Adicionar Plano
                           </Link>
                        </Button>
                    </div>
                     <div className="flex flex-col md:flex-row gap-2 pt-2">
                        <DateRangeFilter
                            onDateChange={(range) => setWorkoutsFilter(prev => ({...prev, range}))}
                        />
                        <Select
                            onValueChange={(value) => setWorkoutsFilter(prev => ({...prev, status: value}))}
                        >
                            <SelectTrigger className="h-9">
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
                       <ul className="max-h-64 overflow-y-auto space-y-3 pr-2">
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
                                            <Link href={`/workouts/${workout.id}`}>
                                                Ver Plano
                                            </Link>
                                       </Button>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para os filtros selecionados.</p>}
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões de Treino</CardTitle>
                    <div className="flex flex-col md:flex-row gap-2 pt-2">
                        <Input 
                            placeholder="Buscar por nome do treino..."
                            value={sessionsFilter.text}
                            onChange={(e) => setSessionsFilter(prev => ({...prev, text: e.target.value}))}
                            className="h-9"
                        />
                         <Select
                            onValueChange={(value: 'all' | 'completed' | 'in-progress') => setSessionsFilter(prev => ({ ...prev, status: value }))}
                            value={sessionsFilter.status}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Filtrar por status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                <SelectItem value="completed">Finalizado</SelectItem>
                                <SelectItem value="in-progress">Em Andamento</SelectItem>
                            </SelectContent>
                        </Select>
                        <DateRangeFilter
                            onDateChange={(range) => setSessionsFilter(prev => ({...prev, range}))}
                        />
                    </div>
                </CardHeader>
                <CardContent><SessionsHistory sessions={filteredSessions} /></CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                <CardContent><ProgressChart measurements={filteredMeasurements} /></CardContent>
            </Card>
        </div>
    );
}
