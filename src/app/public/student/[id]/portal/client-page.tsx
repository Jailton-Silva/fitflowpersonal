
"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Dumbbell, History, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Workout, Measurement, Student, WorkoutSession } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar } from "../actions";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MeasurementsHistory from "@/components/students/measurements-history";
import ProgressChart from "@/components/students/progress-chart";
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SessionsHistory, { FormattedSession } from "@/components/students/sessions-history";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
    const [measurements, setMeasurements] = useState<Measurement[]>(initialMeasurements);
    const [sessions, setSessions] = useState<FormattedSession[]>([]);

    const [isUploading, startUploadTransition] = useTransition();
    const { toast } = useToast();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);

    // Filter states
    const [workoutsFilter, setWorkoutsFilter] = useState<{ status?: 'all' | 'active' | 'inactive', range?: DateRange }>({ status: 'all' });
    const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({});
    const [sessionsFilter, setSessionsFilter] = useState<{ text: string; status?: 'all' | 'completed' | 'in-progress' }>({ text: "", status: 'all' });
    
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
                const { error, path } = await uploadStudentAvatar(student.id, formData);
                if (error) {
                    toast({ title: "Erro no Upload", description: error, variant: "destructive" });
                } else {
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
                }
            });
        }
    };

    const filteredWorkouts = useMemo(() => {
        const fromDate = workoutsFilter.range?.from ? new Date(workoutsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = workoutsFilter.range?.to ? new Date(workoutsFilter.range.to.setHours(23,59,59,999)) : null;

        return workouts.filter(w => {
            const itemDate = parseISO(w.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            const statusMatch = workoutsFilter.status === 'all' || w.status === workoutsFilter.status;
            return dateMatch && statusMatch;
        });
    }, [workouts, workoutsFilter]);

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23,59,59,999)) : null;

        return measurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [measurements, measurementsFilter]);

    const filteredSessions = useMemo(() => {
        const lowerCaseFilter = sessionsFilter.text.toLowerCase();

        return sessions
            .filter(s => {
                const textMatch = !lowerCaseFilter || s.workouts?.name.toLowerCase().includes(lowerCaseFilter);
                const statusMatch = sessionsFilter.status === 'all' || 
                                    (sessionsFilter.status === 'completed' && s.completed_at) ||
                                    (sessionsFilter.status === 'in-progress' && !s.completed_at);

                return textMatch && statusMatch;
            });
    }, [sessions, sessionsFilter]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="relative group shrink-0">
                    <Avatar className="w-24 h-24 border-2 border-primary">
                        <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                        <AvatarFallback className="text-3xl">
                            {student.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                        <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                    </label>
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                    <p className="text-muted-foreground">{student.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2" /> Meus Treinos</CardTitle>
                        <CardDescription>Consulte seus planos de treino ativos e passados.</CardDescription>
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
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                            <DateRangeFilter
                                onDateChange={(range) => setWorkoutsFilter(prev => ({...prev, range}))}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {workouts.length > 0 ? (
                            <ul className="max-h-64 overflow-y-auto space-y-3 pr-2">
                                {filteredWorkouts.map((workout: Workout) => (
                                    <li key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{workout.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                                <Badge variant={workout.status === 'active' ? 'default' : 'secondary'}>
                                                    {workout.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/public/workout/${workout.id}`}>
                                                Ver Treino
                                            </Link>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado.</p>}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2" /> Histórico de Medições</CardTitle>
                        <CardDescription>Acompanhe sua evolução física ao longo do tempo.</CardDescription>
                        <div className="flex flex-col md:flex-row gap-2 pt-2">
                            <DateRangeFilter
                                onDateChange={(range) => setMeasurementsFilter(prev => ({...prev, range}))}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} />
                    </CardContent>
                </Card>
                
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões de Treino</CardTitle>
                        <CardDescription>Veja todos os treinos que você iniciou e completou.</CardDescription>
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
                        </div>
                    </CardHeader>
                    <CardContent><SessionsHistory sessions={filteredSessions} /></CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2" /> Gráfico de Evolução Física</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProgressChart measurements={filteredMeasurements} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
