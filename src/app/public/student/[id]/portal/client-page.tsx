
"use client";

import { useState, useMemo } from "react";
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/public-header";
import { Dumbbell, Activity, History, Calendar, Ruler, Weight, Shield, Cake, Phone, User } from "lucide-react";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    const [workoutStatusFilter, setWorkoutStatusFilter] = useState<string>('all');
    
    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';
    const lastActivity = initialSessions.length > 0 ? new Date(initialSessions[0].started_at) : null;
    
    const filteredWorkouts = useMemo(() => {
        if (workoutStatusFilter === 'all') {
            return initialWorkouts;
        }
        return initialWorkouts.filter(w => w.status === workoutStatusFilter);
    }, [initialWorkouts, workoutStatusFilter]);

    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <PublicHeader studentId={student.id} />

            <main className="flex-1 py-8 px-4">
                 <div className="max-w-4xl mx-auto space-y-6">
                    <header className="flex flex-col sm:flex-row gap-6 items-center bg-card p-6 rounded-xl shadow-sm">
                        <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                            <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                            <AvatarFallback className="text-3xl">
                                {student.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 text-center sm:text-left">
                            <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                            <p className="text-muted-foreground">{student.email}</p>
                            {lastActivity && (
                                <p className="text-sm text-muted-foreground pt-1">Último treino: {format(lastActivity, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                            )}
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg font-headline flex items-center"><User className="mr-2"/> Detalhes Pessoais</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center"><Cake className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Idade:</strong><span className="ml-2">{age} anos</span></div>
                                <div className="flex items-center"><Ruler className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Altura:</strong><span className="ml-2">{student.height ? `${student.height} cm` : 'N/A'}</span></div>
                                <div className="flex items-center"><Weight className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Peso:</strong><span className="ml-2">{student.weight ? `${student.weight} kg` : 'N/A'}</span></div>
                            </CardContent>
                        </Card>
                        <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Objetivos</CardTitle></CardHeader><CardContent><p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2"/> Obs. Saúde</CardTitle></CardHeader><CardContent><p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader>
                           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <CardTitle className="text-lg font-headline flex items-center"><Calendar className="mr-2"/> Meus Treinos</CardTitle>
                                <Select
                                    onValueChange={setWorkoutStatusFilter}
                                    defaultValue="all"
                                >
                                    <SelectTrigger className="w-full sm:w-[180px] h-9">
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle></CardHeader>
                            <CardContent><MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} /></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões</CardTitle></CardHeader>
                            <CardContent><SessionsHistory sessions={initialSessions} /></CardContent>
                        </Card>
                    </div>

                     <Card className="lg:col-span-2">
                        <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                        <CardContent><ProgressChart measurements={initialMeasurements} /></CardContent>
                    </Card>

                 </div>
            </main>
        </div>
    );
}
