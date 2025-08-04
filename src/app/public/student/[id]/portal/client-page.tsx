
"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dumbbell, Activity, Calendar as CalendarIcon, History, User, Upload, Loader2, BarChart2 } from "lucide-react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
    const { toast } = useToast();
    const [sessions, setSessions] = useState<FormattedSession[]>([]);
    const [isUploading, startUploadTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url || null);

    // Filter states
    const [measurementsFilter, setMeasurementsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });
    const [workoutsFilter, setWorkoutsFilter] = useState<{ status: 'all' | 'active' | 'inactive', range?: DateRange }>({ status: 'all' });
    const [sessionsFilter, setSessionsFilter] = useState<{ text: string; status: 'all' | 'completed' | 'in-progress' }>({ text: "", status: 'all' });

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

        return initialMeasurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [initialMeasurements, measurementsFilter]);
    
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
                    setAvatarPreview(student.avatar_url); // Revert on error
                } else {
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada."});
                }
            });
        }
    };


    // Renders the page content
    return (
        <div className="space-y-6 px-[10px]">
            <Card className="overflow-hidden">
                <div className="bg-muted h-20" />
                <CardContent className="flex flex-col sm:flex-row items-center gap-6 -mt-10 p-6">
                     <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-card">
                            <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                            <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                         {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}
                        <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" asChild>
                             <label htmlFor="avatar-upload" className="cursor-pointer">
                                <Upload />
                                <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                            </label>
                        </Button>
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl font-bold font-headline">{student.name}</h1>
                        <p className="text-muted-foreground">{student.email}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Treinos</CardTitle>
                         <div className="flex flex-col md:flex-row gap-2 pt-2">
                             <Select
                                onValueChange={(value: 'all' | 'active' | 'inactive') => setWorkoutsFilter(prev => ({ ...prev, status: value }))}
                                defaultValue="all"
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
                    {filteredWorkouts.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto space-y-3 pr-2">
                            {filteredWorkouts.map((workout: Workout) => (
                                <li key={workout.id}>
                                    <Link href={`/public/workout/${workout.id}`} className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{workout.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                   Criado em {format(parseISO(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                                </p>
                                            </div>
                                            <Badge variant={workout.status === 'active' ? 'default' : 'secondary'}>
                                                {workout.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle>
                        <div className="flex flex-col md:flex-row gap-2 pt-2">
                            <DateRangeFilter
                                onDateChange={(range) => setMeasurementsFilter(prev => ({...prev, range}))}
                            />
                        </div>
                    </CardHeader>
                    <CardContent><MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} /></CardContent>
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
                                defaultValue="all"
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
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><BarChart2 className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                    <CardContent><ProgressChart measurements={filteredMeasurements} /></CardContent>
                </Card>
            </div>
        </div>
    );
}
