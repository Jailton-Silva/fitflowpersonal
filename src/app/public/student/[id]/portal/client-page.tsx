
"use client";

import { useState, useMemo, useTransition } from "react";
import { Workout, Measurement, Student } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Activity, Calendar, User, Edit, Upload, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MeasurementsHistory from "@/components/students/measurements-history";
import ProgressChart from "@/components/students/progress-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadStudentAvatar, logoutStudent } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts: Workout[];
    initialMeasurements: Measurement[];
}

export default function StudentPortalClient({ student, initialWorkouts, initialMeasurements }: StudentPortalClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isUploading, startUploadTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url || null);

    // Filter states
    const [measurementsFilter, setMeasurementsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });
    const [workoutsFilter, setWorkoutsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });
    
     const handleLogout = async () => {
        await logoutStudent(student.id);
        router.push(`/public/student/${student.id}`);
        router.refresh(); // Ensure redirect happens
    };

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
                } else {
                    toast({ title: "Sucesso!", description: "Avatar atualizado." });
                    router.refresh(); // Re-fetch server components to get new URL
                }
            });
        }
    };
    
    const filteredWorkouts = useMemo(() => {
        return initialWorkouts.filter(w => 
            w.name.toLowerCase().includes(workoutsFilter.text.toLowerCase())
        );
    }, [initialWorkouts, workoutsFilter.text]);

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23,59,59,999)) : null;

        return initialMeasurements.filter(m => {
            const itemDate = new Date(m.created_at);
            return (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
        });
    }, [initialMeasurements, measurementsFilter.range]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-2 border-primary">
                        <AvatarImage src={avatarPreview || student.avatar_url || undefined} alt={student.name} />
                        <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                    <p className="text-muted-foreground">Bem-vindo(a) ao seu portal!</p>
                     <Button asChild variant="outline" size="sm">
                       <label htmlFor="avatar-upload" className="cursor-pointer">
                           <Upload className="mr-2 h-4 w-4"/> Alterar Foto
                           <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                       </label>
                   </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline flex items-center"><Dumbbell className="mr-2 h-5 w-5" />Meus Planos de Treino</CardTitle>
                    <div className="pt-2">
                        <Input
                            placeholder="Buscar por nome do treino..."
                            value={workoutsFilter.text}
                            onChange={(e) => setWorkoutsFilter(prev => ({...prev, text: e.target.value}))}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredWorkouts.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredWorkouts.map((workout) => (
                                <li key={workout.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
                                    <div>
                                        <p className="font-semibold">{workout.name}</p>
                                        <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                    </div>
                                    <Button variant="default" asChild className="w-full sm:w-auto ripple">
                                        <Link href={`/public/workout/${workout.id}`}>
                                            Acessar Treino
                                        </Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-muted-foreground text-center py-4">Nenhum plano de treino ativo encontrado.</p>}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline flex items-center"><Activity className="mr-2 h-5 w-5" />Minhas Avaliações Físicas</CardTitle>
                         <div className="pt-2">
                            <DateRangeFilter onDateChange={(range) => setMeasurementsFilter(prev => ({...prev, range}))} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline flex items-center"><Calendar className="mr-2 h-5 w-5" />Gráfico de Evolução</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ProgressChart measurements={filteredMeasurements} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
