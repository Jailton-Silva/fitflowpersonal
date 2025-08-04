
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Student, Workout, Measurement } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Activity, Calendar as CalendarIcon, History, Upload, Loader2, Trophy } from "lucide-react";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";
import { differenceInYears, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { uploadStudentAvatar } from "../actions";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";

type StudentPortalClientProps = {
    student: Student;
    initialWorkouts: Workout[];
    initialMeasurements: Measurement[];
};

export default function StudentPortalClient({ student, initialWorkouts, initialMeasurements }: StudentPortalClientProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url);

    // State for filtering
    const [measurementsFilter, setMeasurementsFilter] = useState<DateRange | undefined>(undefined);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);

        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        const { error, path } = await uploadStudentAvatar(student.id, formData);

        if (error) {
            toast({ title: "Erro no Upload", description: error, variant: "destructive" });
            setAvatarPreview(student.avatar_url); // Revert on failure
        } else {
            toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
            setAvatarPreview(path);
        }
        setIsUploading(false);
    };

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter?.from ? new Date(measurementsFilter.from.setHours(0, 0, 0, 0)) : null;
        const toDate = measurementsFilter?.to ? new Date(measurementsFilter.to.setHours(23, 59, 59, 999)) : null;

        return initialMeasurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [initialMeasurements, measurementsFilter]);


    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Student Info Header */}
                    <Card>
                        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group">
                                <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                                    <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isUploading ? (
                                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                                    ) : (
                                        <Upload className="h-6 w-6 text-white" />
                                    )}
                                    <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                                </label>
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                                <p className="text-muted-foreground">{student.email}</p>
                                <div className="text-sm text-muted-foreground mt-2">
                                    <span>{age} anos</span>
                                    {student.weight && <span> &middot; {student.weight} kg</span>}
                                    {student.height && <span> &middot; {student.height} cm</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workouts Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline"><Dumbbell /> Meus Treinos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {initialWorkouts.length > 0 ? (
                                <ul className="space-y-3">
                                    {initialWorkouts.map((workout) => (
                                        <li key={workout.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2">
                                            <div>
                                                <p className="font-semibold">{workout.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(workout.exercises as any[]).length} exercícios &middot; Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                                                <Link href={`/public/workout/${workout.id}`}>
                                                    Acessar Treino
                                                </Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">Nenhum plano de treino ativo encontrado.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Measurements & Progress Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline"><History /> Histórico de Medições</CardTitle>
                                <div className="pt-2">
                                     <DateRangeFilter onDateChange={setMeasurementsFilter} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline"><Activity /> Gráfico de Evolução</CardTitle>
                                <CardDescription>Sua evolução de peso e % de gordura corporal.</CardDescription>
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
