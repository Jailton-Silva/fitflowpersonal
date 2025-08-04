
"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Cake, Ruler, Weight, Dumbbell, Shield, Upload, Loader2, Activity, History, Calendar, CheckCircle } from "lucide-react";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import SessionsHistory, { FormattedSession } from "@/components/students/sessions-history";
import { uploadStudentAvatar } from "../actions";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
    initialSessions?: EnrichedWorkoutSession[];
}

export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [], initialSessions = [] }: StudentPortalClientProps) {
    const { toast } = useToast();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);
    const [isUploading, startUploadTransition] = useTransition();

    const [workoutsFilter, setWorkoutsFilter] = useState<{ status: string, range?: DateRange }>({ status: 'all' });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && student) {
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
                } else {
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
                }
            });
        }
    };
    
    const age = student.birth_date ? new Date().getFullYear() - new Date(student.birth_date).getFullYear() : 'N/A';

    const getWorkoutStatus = (workoutId: string) => {
        const sessionsForWorkout = initialSessions.filter(s => s.workout_id === workoutId);
        if (sessionsForWorkout.length === 0) {
            return { label: "Não iniciado", variant: "secondary" as const };
        }
        const hasActiveSession = sessionsForWorkout.some(s => !s.completed_at);
        if (hasActiveSession) {
            return { label: "Ativo", variant: "default" as const };
        }
        return { label: "Concluído", variant: "success" as const };
    }


    const filteredWorkouts = useMemo(() => {
        const fromDate = workoutsFilter.range?.from ? new Date(workoutsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = workoutsFilter.range?.to ? new Date(workoutsFilter.range.to.setHours(23,59,59,999)) : null;
        
        return initialWorkouts.filter(w => {
            if(w.status === 'inactive') return false;

            const itemDate = parseISO(w.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            if (!dateMatch) return false;

            const workoutStatus = getWorkoutStatus(w.id).label.toLowerCase().replace(' ', '-');
            const statusMatch = workoutsFilter.status === 'all' || workoutStatus === workoutsFilter.status;

            return statusMatch;
        });
    }, [initialWorkouts, workoutsFilter, initialSessions]);


    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-8 px-[10px]">
                     {/* Welcome Header */}
                    <header className="flex flex-col sm:flex-row gap-6 items-start">
                         <div className="relative group shrink-0">
                            <Avatar className="w-24 h-24 border-2 border-primary">
                                <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                                <AvatarFallback className="text-3xl">
                                    {student.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                             <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {isUploading ? <Loader2 className="h-6 w-6 animate-spin"/> : <Upload className="h-6 w-6"/>}
                                <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                            </label>
                        </div>
                        <div className="flex-1 space-y-1">
                            <h1 className="text-3xl font-bold font-headline">Olá, {student.name.split(' ')[0]}!</h1>
                            <p className="text-muted-foreground">Bem-vindo(a) de volta ao seu portal de treinos.</p>
                        </div>
                    </header>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {/* Personal Details */}
                        <Card className="lg:col-span-1">
                            <CardHeader><CardTitle className="text-lg font-headline flex items-center"><User className="mr-2"/> Seus Dados</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center"><Cake className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Idade:</strong><span className="ml-2">{age} anos</span></div>
                                <div className="flex items-center"><Ruler className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Altura:</strong><span className="ml-2">{student.height ? `${student.height} cm` : 'N/A'}</span></div>
                                <div className="flex items-center"><Weight className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Peso Atual:</strong><span className="ml-2">{student.weight ? `${student.weight} kg` : 'N/A'}</span></div>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-1"><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Seus Objetivos</CardTitle></CardHeader><CardContent><p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p></CardContent></Card>
                        <Card className="lg:col-span-1"><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2"/> Obs. Saúde</CardTitle></CardHeader><CardContent><p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent></Card>
                    </div>

                    {/* Workouts */}
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center"><Calendar className="mr-2"/> Meus Treinos</CardTitle>
                            <CardDescription>Acesse seus planos de treino ativos e seu histórico.</CardDescription>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Select onValueChange={(value) => setWorkoutsFilter(prev => ({ ...prev, status: value }))} defaultValue="all">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="nao-iniciado">Não Iniciado</SelectItem>
                                        <SelectItem value="ativo">Ativo</SelectItem>
                                        <SelectItem value="concluido">Concluído</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <DateRangeFilter onDateChange={(range) => setWorkoutsFilter(prev => ({ ...prev, range }))} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredWorkouts.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredWorkouts.map((workout: Workout) => {
                                        const status = getWorkoutStatus(workout.id);
                                        return (
                                            <li key={workout.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">{workout.name}</p>
                                                        <Badge variant={status.variant as any} className={cn(status.variant === 'success' && 'bg-green-500/80 text-white')}>{status.label}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(workout.exercises as any[]).length} exercícios
                                                    </p>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/public/workout/${workout.id}`}>
                                                            Acessar Treino
                                                        </Link>
                                                </Button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para os filtros selecionados.</p>}
                        </CardContent>
                    </Card>

                    {/* Sessions History */}
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Sessões de Treino</CardTitle>
                             <CardDescription>Seu histórico de treinos iniciados e finalizados.</CardDescription>
                        </CardHeader>
                        <CardContent><SessionsHistory sessions={initialSessions.map(s => ({...s, formattedDate: format(new Date(s.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) }))} /></CardContent>
                    </Card>

                    {/* Progress */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <Card className="lg:col-span-2">
                             <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Suas Avaliações</CardTitle>
                                <CardDescription>Histórico de suas medições físicas.</CardDescription>
                            </CardHeader>
                            <CardContent><MeasurementsHistory studentId={student.id} measurements={initialMeasurements} isPublicView={true} /></CardContent>
                        </Card>
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução</CardTitle>
                                <CardDescription>Sua evolução de peso e gordura corporal.</CardDescription>
                            </CardHeader>
                            <CardContent><ProgressChart measurements={initialMeasurements} /></CardContent>
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
