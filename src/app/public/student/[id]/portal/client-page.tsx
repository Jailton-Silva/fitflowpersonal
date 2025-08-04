
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, Trophy, Dumbbell } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import MeasurementsHistory from "@/components/students/measurements-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProgressChart from "@/components/students/progress-chart";

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
    const [workouts, setWorkouts] = useState(initialWorkouts);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        let filteredWorkouts = initialWorkouts;
        if(filter !== 'all') {
            filteredWorkouts = initialWorkouts.filter(w => w.status === filter);
        }
        setWorkouts(filteredWorkouts);
    }, [filter, initialWorkouts]);
    
    return (
        <div className="space-y-6 px-[10px]">
             <header className="space-y-1">
                <h1 className="text-3xl font-bold font-headline">Olá, {student.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Bem-vindo(a) ao seu portal. Aqui você acompanha seus treinos e sua evolução.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                           <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Treinos</CardTitle>
                           <Select onValueChange={setFilter} defaultValue="all">
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filtrar por status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Treinos</SelectItem>
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
                                    const session = initialSessions.find(s => s.workout_id === workout.id);
                                    const statusKey = workout.status as keyof typeof statusMap;
                                   
                                    return (
                                       <li key={workout.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-3">
                                           <div className="flex-1">
                                               <p className="font-semibold">{workout.name}</p>
                                               <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                           </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Badge variant={statusMap[statusKey]?.variant || 'secondary'} className="w-fit">
                                                  {statusMap[statusKey]?.text || 'Desconhecido'}
                                                </Badge>
                                               <Button variant="outline" size="sm" asChild className="flex-1 ripple">
                                                    <Link href={`/public/workout/${workout.id}`}>
                                                        Ver Treino
                                                    </Link>
                                               </Button>
                                           </div>
                                       </li>
                                   )
                               })}
                           </ul>
                       ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para o filtro selecionado.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle>
                    </CardHeader>
                    <CardContent><MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} /></CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Trophy className="mr-2"/> Sessões de Treino</CardTitle>
                        <CardDescription>Seu histórico de treinos concluídos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="max-h-64 overflow-y-auto space-y-2 pr-2">
                          {initialSessions.filter(s => s.completed_at).length > 0 ? (
                            initialSessions.filter(s => s.completed_at).map(s => (
                                <li key={s.id} className="text-sm p-2 bg-muted/50 rounded-md">
                                    <span className="font-semibold">{s.workouts?.name || 'Treino'}</span> concluído em <span className="font-semibold">{format(parseISO(s.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>.
                                </li>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-center py-4">Nenhuma sessão de treino concluída ainda.</p>
                          )}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle>
                        <CardDescription>Acompanhe seu progresso de peso e gordura corporal ao longo do tempo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProgressChart measurements={initialMeasurements} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
