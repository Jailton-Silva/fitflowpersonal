
"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, History, PlusCircle, User, Cake, Ruler, Weight, Dumbbell, Shield, Phone, Upload, Loader2 } from "lucide-react";
import { parseISO, format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/public-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { uploadAvatar } from "@/app/(app)/students/actions";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    const { toast } = useToast();
    // Filter states
    const [workoutsFilter, setWorkoutsFilter] = useState<{ status?: string }>({});
    const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({});
    const [sessionsFilter, setSessionsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });

    const [lastActivity, setLastActivity] = useState<string | null>(null);
    const [isUploading, startUploadTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url || null);


    useEffect(() => {
        if (initialSessions && initialSessions.length > 0) {
            const mostRecentSession = initialSessions[0]; // Already sorted by date desc
            if (mostRecentSession.completed_at) {
                setLastActivity(format(parseISO(mostRecentSession.completed_at), "'Último treino em' dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
            } else {
                 setLastActivity(format(parseISO(mostRecentSession.started_at), "'Treino iniciado em' dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
            }
        } else {
            setLastActivity("Nenhuma atividade registrada ainda.");
        }
    }, [initialSessions]);
    
     const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload logic
        const formData = new FormData();
        formData.append('avatar', file);
        startUploadTransition(async () => {
            const { error, path } = await uploadAvatar(student.id, formData);
            if (error) {
                toast({ title: "Erro no Upload", description: error, variant: "destructive" });
                // Revert preview on error
                setAvatarPreview(student.avatar_url || null);
            } else {
                toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada."});
                // Optimistically update the student object to reflect the change, or just let revalidation handle it
                student.avatar_url = path;
            }
        });
        }
    };


    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0, 0, 0, 0)) : null;
        const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23, 59, 59, 999)) : null;

        return initialMeasurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [initialMeasurements, measurementsFilter]);

    const filteredWorkouts = useMemo(() => {
        let workouts = initialWorkouts;

        const statusMatch = !workoutsFilter.status || workoutsFilter.status === 'all';
        if (!statusMatch) {
           workouts = workouts.filter(w => w.status === workoutsFilter.status)
        }
        
        return workouts.filter(w => w.status !== 'inactive');

    }, [initialWorkouts, workoutsFilter]);

    const filteredSessions = useMemo(() => {
        const fromDate = sessionsFilter.range?.from ? new Date(sessionsFilter.range.from.setHours(0, 0, 0, 0)) : null;
        const toDate = sessionsFilter.range?.to ? new Date(sessionsFilter.range.to.setHours(23, 59, 59, 999)) : null;
        const lowerCaseFilter = sessionsFilter.text.toLowerCase();

        return initialSessions
            .filter(s => {
                const itemDate = parseISO(s.started_at);
                const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
                const textMatch = !lowerCaseFilter || s.workouts?.name.toLowerCase().includes(lowerCaseFilter);
                return dateMatch && textMatch;
            });
    }, [initialSessions, sessionsFilter]);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';

    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <PublicHeader studentId={student.id} />
            <main className="flex-1">
                <div className="space-y-6 w-full py-8 px-[10px]">
                    <header className="flex flex-col sm:flex-row gap-6 items-start">
                         <div className="flex flex-col items-center gap-2">
                            <Avatar className="w-24 h-24 border-2 border-primary relative group">
                                <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                                <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                                 {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}
                            </Avatar>
                             <Button asChild variant="outline" size="sm">
                                <label htmlFor="avatar-upload" className="cursor-pointer">
                                    <Upload className="mr-2 h-3 w-3"/> Alterar Foto
                                    <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                                </label>
                            </Button>
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                                <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                    {student.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </div>
                            <p>{student.email}</p>
                            <p className="text-sm text-muted-foreground pt-1">{lastActivity}</p>
                        </div>
                    </header>

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


                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <CardTitle className="text-lg font-headline flex items-center"><CalendarIcon className="mr-2" /> Meus Treinos</CardTitle>
                                <div className="w-full sm:w-auto">
                                    <Select
                                        onValueChange={(value) => setWorkoutsFilter(prev => ({ ...prev, status: value }))}
                                        defaultValue="all"
                                    >
                                        <SelectTrigger>
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
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredWorkouts.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredWorkouts.map((workout: Workout) => (
                                        <li key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold">{workout.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(workout.exercises as any[]).length} exercícios - {workout.status === 'completed' ? 'Concluído' : 'Pendente'}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/public/workout/${workout.id}`}>
                                                    Acessar Treino
                                                </Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para os filtros selecionados.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2" /> Histórico de Sessões</CardTitle>
                                 <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Input
                                        placeholder="Buscar por nome do treino..."
                                        value={sessionsFilter.text}
                                        onChange={(e) => setSessionsFilter(prev => ({...prev, text: e.target.value}))}
                                        className="h-9"
                                    />
                                    <DateRangeFilter
                                        onDateChange={(range) => setSessionsFilter(prev => ({ ...prev, range }))}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent><SessionsHistory sessions={filteredSessions} /></CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2" /> Histórico de Medições</CardTitle>
                                <DateRangeFilter
                                    onDateChange={(range) => setMeasurementsFilter(prev => ({ ...prev, range }))}
                                />
                            </div>
                        </CardHeader>
                        <CardContent><MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} /></CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2" /> Gráfico de Evolução</CardTitle></CardHeader>
                        <CardContent><ProgressChart measurements={filteredMeasurements} /></CardContent>
                    </Card>

                </div>
            </main>
             <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );

    