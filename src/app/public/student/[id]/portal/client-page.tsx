
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Dumbbell, History, Activity, Calendar } from "lucide-react";
import { format, differenceInYears } from 'date-fns';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import { EnrichedWorkoutSession } from "./page";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';
    
    const [workoutStatusFilter, setWorkoutStatusFilter] = useState('all');

    const filteredWorkouts = useMemo(() => {
        if (workoutStatusFilter === 'all') {
            return initialWorkouts;
        }
        return initialWorkouts.filter(w => w.status === workoutStatusFilter);
    }, [initialWorkouts, workoutStatusFilter]);

    return (
        <div className="flex-1 py-8 px-[10px] space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Olá, {student.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Bem-vindo(a) ao seu portal. Aqui você pode acompanhar seus treinos e sua evolução.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><User className="mr-2"/> Seus Dados</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center"><strong>Idade:</strong><span className="ml-2">{age} anos</span></div>
                        <div className="flex items-center"><strong>Altura:</strong><span className="ml-2">{student.height ? `${student.height} cm` : 'N/A'}</span></div>
                        <div className="flex items-center"><strong>Peso:</strong><span className="ml-2">{student.weight ? `${student.weight} kg` : 'N/A'}</span></div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Seus Objetivos</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm">{student.goals || "Nenhum objetivo definido pelo seu treinador."}</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                 <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <CardTitle className="text-lg font-headline flex items-center"><Calendar className="mr-2"/> Meus Treinos</CardTitle>
                        <Select value={workoutStatusFilter} onValueChange={setWorkoutStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
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
                               const statusInfo = statusMap[workout.status] || statusMap['inactive'];
                               const isClickable = workout.status === 'active' || workout.status === 'not-started';

                               return (
                                   <li key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                       <div>
                                           <p className="font-semibold">{workout.name}</p>
                                           <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                       </div>
                                       <div className="flex items-center gap-2">
                                           <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                                           <Button asChild size="sm" disabled={!isClickable}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões de Treino</CardTitle></CardHeader>
                    <CardContent>
                        <SessionsHistory sessions={initialSessions.map(s => ({...s, formattedDate: format(new Date(s.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) }))} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle></CardHeader>
                    <CardContent>
                        <MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} />
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                <CardContent>
                    <ProgressChart measurements={initialMeasurements} />
                </CardContent>
            </Card>
        </div>
    );
}
