
"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Dumbbell, Shield, User, Cake, Ruler, Weight, History, Edit, Upload, Loader2, Phone } from "lucide-react";
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory from "@/components/students/sessions-history";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { uploadAvatar } from "@/app/(app)/students/actions";
import PublicHeader from "@/components/layout/public-header";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    const { toast } = useToast();
    const [workoutsFilter, setWorkoutsFilter] = useState<{ status?: string }>({});
    const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({});
    const [sessionsFilter, setSessionsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });
    const [lastActivity, setLastActivity] = useState<string | null>(null);
    const [isUploading, startUploadTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url || null);
    
    useEffect(() => {
        if (initialSessions && initialSessions.length > 0) {
            const mostRecentSession = initialSessions[0]; // Assuming they are sorted by date descending
            if (mostRecentSession.completed_at) {
                setLastActivity(`Finalizou ${mostRecentSession.workouts?.name} em ${format(new Date(mostRecentSession.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
            } else {
                setLastActivity(`Iniciou ${mostRecentSession.workouts?.name} em ${format(new Date(mostRecentSession.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
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
            const { error } = await uploadAvatar(student.id, formData);
            if (error) {
                toast({ title: "Erro no Upload", description: error, variant: "destructive" });
            } else {
                toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada."});
            }
        });
        }
    };


    const filteredWorkouts = useMemo(() => {
        return initialWorkouts.filter(w => {
            const statusMatch = !workoutsFilter.status || workoutsFilter.status === 'all' || w.status === workoutsFilter.status;
            return statusMatch;
        });
    }, [initialWorkouts, workoutsFilter]);

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0, 0, 0, 0)) : null;
        const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23, 59, 59, 999)) : null;

        return initialMeasurements.filter(m => {
            const itemDate = new Date(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [initialMeasurements, measurementsFilter]);

    const filteredSessions = useMemo(() => {
        const fromDate = sessionsFilter.range?.from ? new Date(sessionsFilter.range.from.setHours(0, 0, 0, 0)) : null;
        const toDate = sessionsFilter.range?.to ? new Date(sessionsFilter.range.to.setHours(23, 59, 59, 999)) : null;
        const lowerCaseFilter = sessionsFilter.text.toLowerCase();

        return initialSessions.filter(s => {
            const itemDate = new Date(s.started_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            const textMatch = !lowerCaseFilter || s.workouts?.name.toLowerCase().includes(lowerCaseFilter);
            return dateMatch && textMatch;
        });
    }, [initialSessions, sessionsFilter]);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';
    
    const statusMap: { [key: string]: { text: string, variant: "default" | "secondary" | "destructive" | "outline" | "success" } } = {
        'active': { text: 'Ativo', variant: 'success' },
        'not-started': { text: 'Não Iniciado', variant: 'secondary' },
        'completed': { text: 'Concluído', variant: 'default' },
        'inactive': { text: 'Inativo', variant: 'outline' },
    }

    return (
    <div className="flex flex-col min-h-screen bg-muted">
        <PublicHeader studentId={student.id} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 px-2 sm:px-4 lg:px-10">
                <header className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="relative group">
                         <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                            <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                            <AvatarFallback className="text-3xl">
                                {student.name.charAt(0)}
                            </AvatarFallback>
                             {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            )}
                        </Avatar>
                        <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 cursor-pointer bg-primary text-primary-foreground p-2 rounded-full border-2 border-background hover:bg-primary/90 transition-transform hover:scale-110">
                           <Upload className="h-4 w-4"/>
                           <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                       </label>
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                            <Badge variant={student.status === "active" ? "success" : "secondary"}>
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
                        <p className="text-sm text-muted-foreground pt-1">
                            <strong>Última atividade:</strong> {lastActivity || 'Carregando...'}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Cake className="mr-2"/> Idade</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{age} <span className="text-lg font-normal text-muted-foreground">anos</span></p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Ruler className="mr-2"/> Altura</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{student.height || 'N/A'} <span className="text-lg font-normal text-muted-foreground">cm</span></p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Weight className="mr-2"/> Peso</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{student.weight || 'N/A'} <span className="text-lg font-normal text-muted-foreground">kg</span></p></CardContent></Card>
                    <Card className="sm:col-span-2 lg:col-span-3"><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Objetivos</CardTitle></CardHeader><CardContent><p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p></CardContent></Card>
                    <Card className="sm:col-span-2 lg:col-span-3"><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2"/> Obs. Saúde</CardTitle></CardHeader><CardContent><p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent></Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2" /> Meus Treinos</CardTitle>
                             <Select
                                onValueChange={(value) => setWorkoutsFilter(prev => ({...prev, status: value === 'all' ? undefined : value}))}
                                defaultValue={workoutsFilter.status || 'all'}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
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
                            <ul className="space-y-3">
                                {filteredWorkouts.map((workout: Workout) => (
                                    <li key={workout.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2">
                                        <div>
                                            <p className="font-semibold">{workout.name}</p>
                                            <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Badge variant={statusMap[workout.status]?.variant || 'secondary'} className="inline-flex">
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
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2" /> Histórico de Sessões</CardTitle>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <Input
                                    placeholder="Buscar por nome do treino..."
                                    value={sessionsFilter.text}
                                    onChange={(e) => setSessionsFilter(prev => ({ ...prev, text: e.target.value }))}
                                    className="h-9 w-full md:w-auto"
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
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2" /> Gráfico de Evolução Física</CardTitle></CardHeader>
                    <CardContent><ProgressChart measurements={filteredMeasurements} /></CardContent>
                </Card>
            </div>
        </main>
    </div>
    );
}
