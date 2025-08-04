
"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, History, Upload, Loader2, Calendar } from "lucide-react";
import { parseISO, format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory, { FormattedSession } from "@/components/students/sessions-history";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar } from "../actions";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);
    const [isUploading, startUploadTransition] = useTransition();
    const { toast } = useToast();

    // Filter states
    const [measurementsFilter, setMeasurementsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });
    const [workoutsFilter, setWorkoutsFilter] = useState<{ status: 'all' | 'active' | 'inactive', range?: DateRange }>({ status: 'all' });
    const [sessionsFilter, setSessionsFilter] = useState<{ text: string; range?: DateRange, status?: 'all' | 'completed' | 'in-progress' }>({ text: "", status: 'all' });

    const [sessions, setSessions] = useState<FormattedSession[]>([]);

     useEffect(() => {
        const formattedSessions = initialSessions.map(session => ({
            ...session,
            formattedDate: format(new Date(session.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
        }));
        setSessions(formattedSessions);
    }, [initialSessions]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('avatar', file);
            startUploadTransition(async () => {
                const { error } = await uploadStudentAvatar(student.id, formData);
                if (error) {
                    toast({ title: "Erro no Upload", description: error, variant: "destructive" });
                    setAvatarPreview(student.avatar_url ?? null); // Revert on error
                } else {
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
                }
            });
        }
    };

    const filteredWorkouts = useMemo(() => {
        const fromDate = workoutsFilter.range?.from ? new Date(workoutsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = workoutsFilter.range?.to ? new Date(workoutsFilter.range.to.setHours(23,59,59,999)) : null;

        return initialWorkouts.filter(w => {
            const itemDate = parseISO(w.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            const statusMatch = workoutsFilter.status === 'all' || w.status === workoutsFilter.status;

            return dateMatch && statusMatch;
        });
    }, [initialWorkouts, workoutsFilter]);

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

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';

    return (
        <div className="max-w-4xl mx-auto py-8 px-[10px] space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="relative group">
                    <Avatar className="w-24 h-24 border-2 border-primary">
                        <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                        <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Upload className="h-6 w-6 text-white" />}
                        <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                    </label>
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                    <p className="text-muted-foreground">Bem-vindo(a) ao seu portal de acompanhamento!</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2" /> Meus Treinos</CardTitle>
                    <CardDescription>Aqui estão seus planos de treino ativos. Clique em "Ver Treino" para começar.</CardDescription>
                     <div className="flex flex-col md:flex-row gap-2 pt-2">
                        <Select
                            onValueChange={(value: 'all' | 'active' | 'inactive') => setWorkoutsFilter(prev => ({ ...prev, status: value }))}
                            value={workoutsFilter.status}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Filtrar por status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                <SelectItem value="active">Ativos</SelectItem>
                                <SelectItem value="inactive">Concluídos</SelectItem>
                            </SelectContent>
                        </Select>
                        <DateRangeFilter
                            onDateChange={(range) => setWorkoutsFilter(prev => ({...prev, range}))}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredWorkouts.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredWorkouts.map((workout: Workout) => {
                                const isInactive = workout.status === 'inactive';
                                return (
                                    <li key={workout.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{workout.name}</p>
                                                <Badge variant={isInactive ? "secondary" : "default"}>
                                                    {isInactive ? "Concluído" : "Ativo"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                            </p>
                                        </div>
                                        <Button asChild size="sm" disabled={isInactive}>
                                            <Link href={`/public/workout/${workout.id}`}>
                                                Ver Treino
                                            </Link>
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Nenhum plano de treino encontrado.</p>
                    )}
                </CardContent>
            </Card>

             <Card>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2" /> Minhas Medições</CardTitle>
                        <CardDescription>Acompanhe seu histórico de avaliações físicas.</CardDescription>
                         <div className="flex flex-col md:flex-row gap-2 pt-2">
                             <DateRangeFilter
                                onDateChange={(range) => setMeasurementsFilter(prev => ({...prev, range}))}
                            />
                        </div>
                    </CardHeader>
                    <CardContent><MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} /></CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Calendar className="mr-2" /> Meus Dados</CardTitle>
                        <CardDescription>Suas informações pessoais cadastradas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div><strong>Idade:</strong> {age} anos</div>
                        <div><strong>Altura:</strong> {student.height ? `${student.height} cm` : 'N/A'}</div>
                        <div><strong>Peso:</strong> {student.weight ? `${student.weight} kg` : 'N/A'}</div>
                        <div><strong>Objetivos:</strong> {student.goals || 'Nenhum objetivo definido.'}</div>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                    <CardContent><ProgressChart measurements={filteredMeasurements} /></CardContent>
                </Card>
            </div>
        </div>
    );
}
