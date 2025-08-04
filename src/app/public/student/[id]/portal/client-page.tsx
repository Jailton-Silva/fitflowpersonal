
"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, differenceInYears, parseISO } from 'date-fns';
import { DateRange } from "react-day-picker";
import { ptBR } from 'date-fns/locale';

import { Workout, Measurement, Student } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar, logoutStudent } from "../actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Cake, Ruler, Weight, Dumbbell, Shield, Phone, Activity, History, Trophy, Upload, Loader2, LogOut } from "lucide-react";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import MeasurementsHistory from "@/components/students/measurements-history";
import ProgressChart from "@/components/students/progress-chart";
import PublicHeader from "@/components/layout/public-header";

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts: Workout[];
    initialMeasurements: Measurement[];
}

export default function StudentPortalClient({ student, initialWorkouts, initialMeasurements }: StudentPortalClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isUploading, startUploadTransition] = useTransition();

    const [workoutsFilter, setWorkoutsFilter] = useState("");
    const [measurementsRange, setMeasurementsRange] = useState<DateRange | undefined>();

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';

    const filteredWorkouts = useMemo(() => {
        if (!workoutsFilter) return initialWorkouts;
        return initialWorkouts.filter(w => w.name.toLowerCase().includes(workoutsFilter.toLowerCase()));
    }, [initialWorkouts, workoutsFilter]);

    const filteredMeasurements = useMemo(() => {
        if (!measurementsRange?.from) return initialMeasurements;
        const fromDate = new Date(measurementsRange.from.setHours(0,0,0,0));
        const toDate = measurementsRange.to ? new Date(measurementsRange.to.setHours(23,59,59,999)) : new Date(measurementsRange.from.setHours(23,59,59,999));
        
        return initialMeasurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            return itemDate >= fromDate && itemDate <= toDate;
        });
    }, [initialMeasurements, measurementsRange]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            startUploadTransition(async () => {
                const { error } = await uploadStudentAvatar(student.id, formData);
                if (error) {
                    toast({ title: "Erro no Upload", description: error, variant: "destructive" });
                } else {
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada."});
                    router.refresh();
                }
            });
        }
    };
    
    const handleLogout = async () => {
        await logoutStudent(student.id);
        router.push(`/public/student/${student.id}`);
    }

    return (
         <div className="flex flex-col min-h-screen bg-muted">
            <PublicHeader studentId={student.id} />
             <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center bg-card p-6 rounded-lg shadow-sm">
                        <div className="relative group">
                            <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                                <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                                <AvatarFallback className="text-3xl">
                                    {student.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                             {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                            <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                            <p className="text-muted-foreground">{student.email}</p>
                            <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground pt-1 gap-4">
                               {student.phone && ( <div className="flex items-center"><Phone className="mr-2 h-4 w-4" /><span>{student.phone}</span></div>)}
                               {age !== 'N/A' && (<div className="flex items-center"><Cake className="mr-2 h-4 w-4"/><span>{age} anos</span></div>)}
                            </div>
                             <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
                               <Button asChild variant="outline" size="sm">
                                   <label htmlFor="avatar-upload" className="cursor-pointer">
                                       <Upload className="mr-2 h-4 w-4"/> Alterar Foto
                                       <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                                   </label>
                               </Button>
                             </div>
                        </div>
                    </div>
                    
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Planos de Treino</CardTitle>
                             <div className="pt-2">
                                <Input 
                                    placeholder="Filtrar treinos por nome..."
                                    value={workoutsFilter}
                                    onChange={(e) => setWorkoutsFilter(e.target.value)}
                                />
                             </div>
                        </CardHeader>
                        <CardContent>
                            {filteredWorkouts.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredWorkouts.map((workout) => (
                                        <Link key={workout.id} href={`/public/workout/${workout.id}`} className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                           <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{workout.name}</p>
                                                    <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                                </div>
                                                <Button variant="outline" size="sm">Ver Treino</Button>
                                           </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">Nenhum plano de treino encontrado.</p>
                            )}
                        </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Minhas Avaliações Físicas</CardTitle>
                                <div className="pt-2">
                                    <DateRangeFilter onDateChange={setMeasurementsRange} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Trophy className="mr-2"/> Meus Objetivos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{student.goals || "Nenhum objetivo definido."}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ProgressChart measurements={filteredMeasurements} />
                        </CardContent>
                    </Card>

                </div>
            </main>
             <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}
