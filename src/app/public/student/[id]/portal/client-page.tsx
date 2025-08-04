
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, Dumbbell, History, Upload, User, Loader2 } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar } from "./actions";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts: Workout[];
    initialMeasurements: Measurement[];
}


export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [] }: StudentPortalClientProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);
    const [isUploading, startUploadTransition] = useTransition();
    const { toast } = useToast();

    // Filter states
    const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({});
    const [workoutsFilter, setWorkoutsFilter] = useState<{ range?: DateRange, status?: 'all' | 'active' | 'inactive' }>({ status: 'all' });


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
                    // Revert preview on error
                    setAvatarPreview(student.avatar_url ?? null);
                } else {
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
                }
            });
        }
    };
    
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

    return (
        <div className="flex flex-col min-h-screen bg-muted">

            <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                     <header className="flex flex-col sm:flex-row gap-6 items-center">
                        <div className="relative">
                            <Avatar className="w-24 h-24 border-2 border-primary group">
                                <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                                <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}
                            </Avatar>
                             <Button asChild size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                               <label htmlFor="avatar-upload" className="cursor-pointer">
                                   <Upload className="h-4 w-4"/>
                                   <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                               </label>
                           </Button>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-3xl font-bold font-headline">Bem-vindo(a), {student.name}!</h1>
                            <p className="text-muted-foreground">Este é o seu portal pessoal. Aqui você encontra seus treinos, acompanha seu progresso e mais.</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><CalendarIcon className="mr-2"/> Meus Treinos</CardTitle>
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
                                            <SelectItem value="inactive">Inativos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <DateRangeFilter
                                        onDateChange={(range) => setWorkoutsFilter(prev => ({...prev, range}))}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                            {filteredWorkouts.length > 0 ? (
                                <ul className="max-h-64 overflow-y-auto space-y-3 pr-2">
                                    {filteredWorkouts.map((workout: Workout) => (
                                        <li key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold">{workout.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(workout.exercises as any[]).length} exercícios
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/public/workout/${workout.id}`}>
                                                    Ver Plano
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
                                <CardTitle className="text-lg font-headline flex items-center"><History className="mr-2"/> Histórico de Medições</CardTitle>
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
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProgressChart measurements={filteredMeasurements} />
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
