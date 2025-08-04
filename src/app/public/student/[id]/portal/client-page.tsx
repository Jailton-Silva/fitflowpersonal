
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Activity, Calendar, FileText, ArrowRight } from "lucide-react";

import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import ProgressChart from "@/components/students/progress-chart";
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
    
    const [workoutsFilter, setWorkoutsFilter] = useState<'all' | 'not-started' | 'active' | 'completed'>('all');
    const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);

     useEffect(() => {
        const lastSession = initialSessions?.[0]; // Assuming sessions are sorted by date descending
        if(lastSession?.started_at) {
            setLastActivityDate(format(new Date(lastSession.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
        }
    }, [initialSessions]);

    const filteredWorkouts = useMemo(() => {
        if (workoutsFilter === 'all') return initialWorkouts;
        return initialWorkouts.filter(w => w.status === workoutsFilter);
    }, [initialWorkouts, workoutsFilter]);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : null;

    return (
        <div className="flex flex-col min-h-screen">
             <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                     <header className="flex flex-col sm:flex-row gap-6 items-start">
                        <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-primary shrink-0">
                            <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                            <AvatarFallback className="text-4xl">
                                {student.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <h1 className="text-3xl sm:text-4xl font-bold font-headline">{student.name}</h1>
                            <p className="text-muted-foreground">{student.email}</p>
                            <p className="text-sm text-muted-foreground">Última atividade em: {lastActivityDate || 'Nenhuma registrada'}</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Treinos</CardTitle>
                                <CardDescription>Seus planos de treino atribuídos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select onValueChange={(value: 'all' | 'not-started' | 'active' | 'completed') => setWorkoutsFilter(value)} defaultValue="all">
                                    <SelectTrigger className="mb-4">
                                        <SelectValue placeholder="Filtrar por status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Status</SelectItem>
                                        <SelectItem value="not-started">Não Iniciado</SelectItem>
                                        <SelectItem value="active">Ativo</SelectItem>
                                        <SelectItem value="completed">Concluído</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ul className="max-h-64 overflow-y-auto space-y-3 pr-2">
                                {filteredWorkouts.length > 0 ? filteredWorkouts.map(workout => (
                                    <li key={workout.id}>
                                        <Link href={`/public/workout/${workout.id}`} className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold flex-1 pr-2">{workout.name}</p>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                 <Badge variant={statusMap[workout.status]?.variant || 'secondary'}>
                                                    {statusMap[workout.status]?.text || 'Desconhecido'}
                                                 </Badge>
                                                 <span className="text-xs text-muted-foreground">{(workout.exercises as any[]).length} exercícios</span>
                                            </div>
                                        </Link>
                                    </li>
                                )) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado.</p>}
                                </ul>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle>
                                <CardDescription>Suas avaliações físicas registradas.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Calendar className="mr-2"/> Histórico de Sessões</CardTitle>
                                <CardDescription>Seus treinos concluídos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SessionsHistory sessions={initialSessions} />
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-3">
                             <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><FileText className="mr-2"/> Meus Dados</CardTitle>
                                <CardDescription>Suas informações e objetivos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     <div>
                                        <p className="font-semibold text-muted-foreground">Idade</p>
                                        <p>{age ? `${age} anos` : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-muted-foreground">Altura</p>
                                        <p>{student.height ? `${student.height} cm` : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-muted-foreground">Peso Inicial</p>
                                        <p>{student.weight ? `${student.weight} kg` : 'N/A'}</p>
                                    </div>
                                     <div>
                                        <p className="font-semibold text-muted-foreground">Telefone</p>
                                        <p>{student.phone || 'N/A'}</p>
                                    </div>
                               </div>
                               <div>
                                   <p className="font-semibold text-muted-foreground">Objetivos</p>
                                   <p className="whitespace-pre-wrap">{student.goals || "Nenhum objetivo definido."}</p>
                               </div>
                               <div>
                                   <p className="font-semibold text-muted-foreground">Observações de Saúde</p>
                                   <p className="whitespace-pre-wrap">{student.medical_conditions || "Nenhuma condição médica informada."}</p>
                               </div>
                            </CardContent>
                        </Card>
                         <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle>
                                <CardDescription>Acompanhe seu progresso visualmente.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProgressChart measurements={initialMeasurements} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}

