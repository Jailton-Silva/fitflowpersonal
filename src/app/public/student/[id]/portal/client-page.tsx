
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Student, Workout, Measurement } from "@/lib/definitions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Activity, Calendar as CalendarIcon, Upload, Loader2, Weight, Ruler } from "lucide-react";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import { uploadStudentAvatar } from "../actions";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts: Workout[];
    initialMeasurements: Measurement[];
}

export default function StudentPortalClient({ student, initialWorkouts, initialMeasurements }: StudentPortalClientProps) {
    const { toast } = useToast();
    const [isUploading, startUploadTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);

    const [workouts, setWorkouts] = useState(initialWorkouts);
    const [measurements, setMeasurements] = useState(initialMeasurements);
    const [workoutFilter, setWorkoutFilter] = useState<DateRange | undefined>();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('avatar', file);

        startUploadTransition(async () => {
            const result = await uploadStudentAvatar(student.id, formData);
            if (result?.error) {
                toast({ title: "Erro no Upload", description: result.error, variant: "destructive" });
                setAvatarPreview(student.avatar_url ?? null); // Revert on error
            } else {
                toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
                // The new path is returned, update the state to reflect it immediately
                if (result?.path) {
                    setAvatarPreview(result.path);
                }
            }
        });
    };
    
    const filteredWorkouts = workouts.filter(workout => {
        if (!workoutFilter?.from) return true;
        const workoutDate = new Date(workout.created_at);
        const fromDate = new Date(workoutFilter.from.setHours(0,0,0,0));
        const toDate = workoutFilter.to ? new Date(workoutFilter.to.setHours(23,59,59,999)) : new Date();
        return workoutDate >= fromDate && workoutDate <= toDate;
    });

    return (
        <main className="flex-1 py-8 px-4 bg-muted">
            <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                            <div className="relative">
                                 <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                                    <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                           
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                                <p className="text-muted-foreground">Bem-vindo(a) ao seu portal de acompanhamento!</p>
                                 <Button asChild variant="outline" size="sm" className="mt-4">
                                    <label htmlFor="avatar-upload" className="cursor-pointer">
                                        <Upload className="mr-2 h-4 w-4"/> Alterar Foto
                                        <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                                    </label>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Tabs defaultValue="workouts" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="workouts"><Dumbbell className="mr-2"/>Meus Treinos</TabsTrigger>
                        <TabsTrigger value="progress"><Activity className="mr-2"/>Meu Progresso</TabsTrigger>
                        <TabsTrigger value="calendar"><CalendarIcon className="mr-2"/>Agenda</TabsTrigger>
                    </TabsList>

                    <TabsContent value="workouts" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Meus Planos de Treino</CardTitle>
                                <CardDescription>Aqui estão todos os treinos que seu personal trainer preparou para você.</CardDescription>
                                <div className="pt-2">
                                  <DateRangeFilter onDateChange={(range) => setWorkoutFilter(range)} />
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
                                                        {(workout.exercises as any[]).length} exercícios - Criado em {format(new Date(workout.created_at), 'dd/MM/yy', { locale: ptBR })}
                                                    </p>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/public/workout/${workout.id}`}>Acessar Treino</Link>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted-foreground text-center py-4">Nenhum treino encontrado para o período selecionado.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="progress" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="lg:col-span-2">
                                 <CardHeader>
                                    <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle>
                                    <CardDescription>Sua evolução de peso e gordura corporal ao longo do tempo.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProgressChart measurements={measurements} />
                                </CardContent>
                            </Card>
                             <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline flex items-center"><Weight className="mr-2"/> Histórico de Medições</CardTitle>
                                    <CardDescription>Todos os registros das suas avaliações físicas.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <MeasurementsHistory studentId={student.id} measurements={measurements} isPublicView={true}/>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                     <TabsContent value="calendar" className="mt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Agenda</CardTitle>
                                <CardDescription>Seus próximos treinos e consultas agendados.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <p className="text-muted-foreground text-center py-8">A funcionalidade de agenda do aluno estará disponível em breve.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                 <footer className="text-center py-4 text-muted-foreground text-xs">
                    <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
                </footer>
            </div>
        </main>
    );
}
