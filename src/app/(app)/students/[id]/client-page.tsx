
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, History, PlusCircle, Lock, User, Cake, Ruler, Weight, Dumbbell, Shield, Phone, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementForm from "@/components/students/measurement-form";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StudentAccessForm from "@/components/students/student-access-form";
import CopyWorkoutLinkButton from "@/components/workouts/copy-workout-link-button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, differenceInYears } from 'date-fns';
import StudentForm from "@/components/students/student-form";
import CopyPortalLinkButton from "@/components/students/copy-portal-link-button";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentDetailClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

function PageSkeleton() {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}

export default function StudentDetailClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentDetailClientProps) {
    
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const { toast } = useToast();
    const [copiedWorkoutId, setCopiedWorkoutId] = useState<string | null>(null);

    const handleCopyWorkoutLink = (workoutId: string) => {
        // Garante que o link copiado SEMPRE aponte para o site em produção.
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fitflowpersonal.vercel.app';
        const workoutUrl = `${siteUrl}/portal/${student.id}/workout/${workoutId}`;

        navigator.clipboard.writeText(workoutUrl).then(() => {
            toast({ title: "Sucesso!", description: "Link do treino copiado para a área de transferência." });
            setCopiedWorkoutId(workoutId);
            setTimeout(() => setCopiedWorkoutId(null), 3000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
            toast({ title: "Erro!", description: "Não foi possível copiar o link.", variant: "destructive" });
        });
    };

    const [measurementsFilter, setMeasurementsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });
    const [workoutsFilter, setWorkoutsFilter] = useState<{ range?: DateRange; status?: string }>({});
    const [sessionsFilter, setSessionsFilter] = useState<{ text: string; range?: DateRange, status?: 'all' | 'completed' | 'in-progress' }>({ text: "", status: 'all' });

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23,59,59,999)) : null;
        const lowerCaseFilter = measurementsFilter.text.toLowerCase();

        return initialMeasurements.filter(m => {
            const itemDate = new Date(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            const textMatch = !lowerCaseFilter || (m.notes?.toLowerCase().includes(lowerCaseFilter));
            return dateMatch && textMatch;
        });
    }, [initialMeasurements, measurementsFilter]);
    
    const filteredWorkouts = useMemo(() => {
        const fromDate = workoutsFilter.range?.from ? new Date(workoutsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = workoutsFilter.range?.to ? new Date(workoutsFilter.range.to.setHours(23,59,59,999)) : null;

        return initialWorkouts.filter(w => {
            const itemDate = new Date(w.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            const statusMatch = !workoutsFilter.status || workoutsFilter.status === 'all' || w.status === workoutsFilter.status;
            return dateMatch && statusMatch;
        });
    }, [initialWorkouts, workoutsFilter]);

    const filteredSessions = useMemo(() => {
        const fromDate = sessionsFilter.range?.from ? new Date(sessionsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = sessionsFilter.range?.to ? new Date(sessionsFilter.range.to.setHours(23,59,59,999)) : null;
        const lowerCaseFilter = sessionsFilter.text.toLowerCase();

        return initialSessions
            .filter(s => {
                const itemDate = new Date(s.started_at);
                const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
                const textMatch = !lowerCaseFilter || s.workouts?.name.toLowerCase().includes(lowerCaseFilter);
                
                const statusMatch = sessionsFilter.status === 'all' || 
                                    (sessionsFilter.status === 'completed' && s.completed_at) ||
                                    (sessionsFilter.status === 'in-progress' && !s.completed_at);

                return dateMatch && textMatch && statusMatch;
            });
    }, [initialSessions, sessionsFilter]);
    
    const statusMap: {[key: string]: {text: string, variant: "default" | "secondary" | "destructive" | "outline" | "success"}} = {
        'active': {text: 'Ativo', variant: 'success'},
        'not-started': {text: 'Não Iniciado', variant: 'secondary'},
        'completed': {text: 'Concluído', variant: 'default'},
        'inactive': {text: 'Inativo', variant: 'outline'},
    }

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';

    if (!isClient) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-3xl">
                        {student.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{student.email}</p>
                     {student.phone && (
                        <div className="flex items-center text-sm text-muted-foreground pt-1">
                           <Phone className="mr-2 h-4 w-4" />
                            <span>{student.phone}</span>
                        </div>
                    )}
                </div>
                 <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                    <StudentForm student={student}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Aluno
                        </Button>
                    </StudentForm>
                    <CopyPortalLinkButton studentId={student.id} />
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><User className="mr-2"/> Detalhes Pessoais</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center"><Cake className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Idade:</strong><span className="ml-2">{age} anos</span></div>
                         <div className="flex items-center"><Ruler className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Altura:</strong><span className="ml-2">{student.height ? `${student.height} cm` : 'N/A'}</span></div>
                        <div className="flex items-center"><Weight className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Peso Atual:</strong><span className="ml-2">{student.weight ? `${student.weight} kg` : 'N/A'}</span></div>
                    </CardContent>
                </Card>
                 <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Objetivos</CardTitle></CardHeader><CardContent><p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p></CardContent></Card>
                 <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2"/> Obs. Saúde</CardTitle></CardHeader><CardContent><p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Lock className="mr-2"/> Acesso ao Portal do Aluno</CardTitle></CardHeader>
                    <CardContent>
                        <StudentAccessForm student={student} />
                    </CardContent>
                </Card>
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
                                        <CopyWorkoutLinkButton 
                                            onClick={() => handleCopyWorkoutLink(workout.id)}
                                            isCopied={copiedWorkoutId === workout.id}
                                        />
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
        </div>
    );
}
