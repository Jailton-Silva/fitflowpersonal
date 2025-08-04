
"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, Dumbbell, Upload, Loader2, Edit } from "lucide-react";
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, Student } from "@/lib/definitions";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar } from "../actions";

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
}

export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [] }: StudentPortalClientProps) {
    const { toast } = useToast();
    const [isUploading, startUploadTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url);

    const [workoutsFilter, setWorkoutsFilter] = useState<{ range?: DateRange }>({});
    const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({});

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
                const result = await uploadStudentAvatar(student.id, formData);
                if (result?.error) {
                    toast({ title: "Erro no Upload", description: result.error, variant: "destructive" });
                    setAvatarPreview(student.avatar_url); // Revert preview on error
                } else {
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
                    // The new path is in result.path, but revalidation will handle the update
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
        const fromDate = workoutsFilter.range?.from ? new Date(workoutsFilter.range.from.setHours(0, 0, 0, 0)) : null;
        const toDate = workoutsFilter.range?.to ? new Date(workoutsFilter.range.to.setHours(23, 59, 59, 999)) : null;

        return initialWorkouts.filter(w => {
            const itemDate = parseISO(w.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [initialWorkouts, workoutsFilter]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-24 h-24 border-2 border-primary relative group">
                            <AvatarImage src={avatarPreview || undefined} alt={student?.name} />
                            <AvatarFallback className="text-3xl">{student?.name.charAt(0)}</AvatarFallback>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            )}
                        </Avatar>
                        <Button asChild variant="outline" size="sm">
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" /> Alterar Foto
                                <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                            </label>
                        </Button>
                    </div>
                    <CardTitle className="text-3xl font-headline mt-4">{student.name}</CardTitle>
                    <CardDescription>Bem-vindo(a) ao seu portal de acompanhamento!</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2" /> Meus Planos de Treino</CardTitle>
                        <div className="pt-2">
                             <DateRangeFilter
                                onDateChange={(range) => setWorkoutsFilter({ range })}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredWorkouts.length > 0 ? (
                            <ul className="max-h-80 overflow-y-auto space-y-3 pr-2">
                                {filteredWorkouts.map((workout: Workout) => (
                                    <li key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{workout.name}</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
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
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2" /> Minhas Medições</CardTitle>
                         <div className="pt-2">
                            <DateRangeFilter
                                onDateChange={(range) => setMeasurementsFilter({ range })}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} />
                    </CardContent>
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

