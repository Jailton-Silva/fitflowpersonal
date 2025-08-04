
"use client";

import { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Cake, Ruler, Weight, Dumbbell, Shield, Phone, History, Activity, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { format, differenceInYears, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory, { FormattedSession } from "@/components/students/sessions-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";


type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

const statusMap: {[key: string]: {text: string, variant: "default" | "secondary" | "destructive" | "outline" | "success"}} = {
    'active': {text: 'Ativo', variant: 'success'},
    'not-started': {text: 'Não Iniciado', variant: 'secondary'},
    'completed': {text: 'Concluído', variant: 'default'},
    'inactive': {text: 'Inativo', variant: 'outline'},
}

export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    
    const [sessions, setSessions] = useState<FormattedSession[]>([]);
    const [workoutStatusFilter, setWorkoutStatusFilter] = useState<'all' | Workout['status']>('all');

    useEffect(() => {
        const formattedSessions = initialSessions.map(session => ({
            ...session,
            formattedDate: format(new Date(session.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
        }));
        setSessions(formattedSessions);
    }, [initialSessions]);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';

    const filteredWorkouts = useMemo(() => {
        return initialWorkouts.filter(w => {
             const statusMatch = !workoutStatusFilter || workoutStatusFilter === 'all' || w.status === workoutStatusFilter;
             return statusMatch;
        });
    }, [initialWorkouts, workoutStatusFilter]);

    return (
        <div className="px-[10px] space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-3xl">
                        {student.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                    <p className="text-muted-foreground">{student.email}</p>
                    {student.phone && (
                        <div className="flex items-center text-sm text-muted-foreground pt-1">
                            <Phone className="mr-2 h-4 w-4" />
                            <span>{student.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><User className="mr-2" /> Detalhes Pessoais</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center"><Cake className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Idade:</strong><span className="ml-2">{age} anos</span></div>
                        <div className="flex items-center"><Ruler className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Altura:</strong><span className="ml-2">{student.height ? `${student.height} cm` : 'N/A'}</span></div>
                        <div className="flex items-center"><Weight className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Peso Atual:</strong><span className="ml-2">{student.weight ? `${student.weight} kg` : 'N/A'}</span></div>
                    </CardContent>
                </Card>
                <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2" /> Objetivos</CardTitle></CardHeader><CardContent><p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2" /> Obs. Saúde</CardTitle></CardHeader><CardContent><p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent></Card>
            </div>
            
             <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <CardTitle className="text-lg font-headline flex items-center"><CalendarIcon className="mr-2" /> Meus Treinos</CardTitle>
                        <Select
                            onValueChange={(value: 'all' | Workout['status']) => setWorkoutStatusFilter(value)}
                            value={workoutStatusFilter}
                        >
                            <SelectTrigger className="h-9 w-full sm:w-auto sm:min-w-[180px]">
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
                            {filteredWorkouts.map((workout: Workout) => {
                                const isClickable = workout.status === 'active' || workout.status === 'not-started';
                                return (
                                <li key={workout.id} className={cn("flex items-center justify-between p-3 rounded-lg", isClickable ? 'bg-muted/50' : 'bg-muted/20 opacity-70')}>
                                    <div>
                                        <p className="font-semibold">{workout.name}</p>
                                        <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusMap[workout.status]?.variant || 'secondary'}>
                                            {statusMap[workout.status]?.text || 'Desconhecido'}
                                        </Badge>
                                        <Button variant="outline" size="sm" asChild disabled={!isClickable}>
                                            <Link href={`/public/workout/${workout.id}`}>
                                                Ver Plano
                                            </Link>
                                        </Button>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para os filtros selecionados.</p>}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2" /> Histórico de Medições</CardTitle>
                    </CardHeader>
                    <CardContent><MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} /></CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2" /> Histórico de Sessões</CardTitle>
                    </CardHeader>
                    <CardContent><SessionsHistory sessions={sessions} /></CardContent>
                </Card>
            </div>
             <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                <CardContent><ProgressChart measurements={initialMeasurements} /></CardContent>
            </Card>
        </div>
    );
}
