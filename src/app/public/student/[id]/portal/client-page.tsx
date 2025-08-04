
"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, Dumbbell, History, Upload, Loader2, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar } from "../actions";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts: Workout[];
    initialMeasurements: Measurement[];
}

export default function StudentPortalClient({ student, initialWorkouts, initialMeasurements }: StudentPortalClientProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);
    const [isUploading, startUploadTransition] = useTransition();
    const { toast } = useToast();
    
    // Filter states
    const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({});
    const [workoutsFilter, setWorkoutsFilter] = useState<{ status: 'all' | 'active' | 'inactive', range?: DateRange }>({ status: 'all' });

    useEffect(() => {
        setAvatarPreview(student.avatar_url ?? null);
    }, [student.avatar_url]);

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
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            
            <header className="flex flex-col sm:flex-row items-center gap-6">
                 <div className="relative group">
                    <Avatar className="w-24 h-24 border-2 border-primary">
                        <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                        <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                         {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}
                    </Avatar>
                     <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 cursor-pointer bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-transform transform group-hover:scale-110">
                        <Upload className="h-4 w-4" />
                        <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                    </label>
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold font-headline">Bem-vindo(a), {student.name}!</h1>
                    <p className="text-muted-foreground">Este é o seu portal pessoal. Acompanhe seus treinos e sua evolução.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Treinos</CardTitle>
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
                                onDateChange={(range) => setWorkoutsFilter(prev => ({ ...prev, range }))}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="max-h-80 overflow-y-auto pr-3">
                        {filteredWorkouts.length > 0 ? (
                            <ul className="space-y-3">
                                {filteredWorkouts.map((workout: Workout) => (
                                    <li key={workout.id}>
                                         <Card className="hover:border-primary transition-colors">
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base font-headline">{workout.name}</CardTitle>
                                                    <Badge variant={workout.status === 'active' ? 'default' : 'secondary'}>
                                                        {workout.status === 'active' ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </div>
                                                <CardDescription>{(workout.exercises as any[]).length} exercícios</CardDescription>
                                            </CardHeader>
                                            <CardFooter>
                                                <Button className="w-full ripple" size="sm" asChild>
                                                     <Link href={`/public/workout/${workout.id}`}>
                                                        Acessar Treino
                                                    </Link>
                                                </Button>
                                            </CardFooter>
                                         </Card>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Nenhum plano de treino encontrado.</p>
                        )}
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
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Minha Evolução Física</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProgressChart measurements={filteredMeasurements} />
                </CardContent>
            </Card>
        </div>
    );
}
