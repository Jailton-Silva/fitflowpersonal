

"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Dumbbell, Trophy, Phone, Cake, Upload, Loader2, Power } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout, Measurement, Student } from "@/lib/definitions";
import MeasurementsHistory from "@/components/students/measurements-history";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRange } from "react-day-picker";
import ProgressChart from "@/components/students/progress-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadStudentAvatar } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { logoutStudent } from "../actions";
import { useRouter } from "next/navigation";


type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
}


export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [] }: StudentPortalClientProps) {
    
    // Filter states
    const [workoutsFilter, setWorkoutsFilter] = useState("");
    const [measurementsFilterRange, setMeasurementsFilterRange] = useState<DateRange | undefined>();
    const [isUploading, startUploadTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);
    const { toast } = useToast();
    const router = useRouter();


    const filteredWorkouts = useMemo(() => {
        const lowerCaseFilter = workoutsFilter.toLowerCase();
        return initialWorkouts.filter(w => {
            return !lowerCaseFilter || w.name.toLowerCase().includes(lowerCaseFilter)
        });
    }, [initialWorkouts, workoutsFilter]);

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilterRange?.from ? new Date(measurementsFilterRange.from.setHours(0,0,0,0)) : null;
        const toDate = measurementsFilterRange?.to ? new Date(measurementsFilterRange.to.setHours(23,59,59,999)) : null;

        return initialMeasurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [initialMeasurements, measurementsFilterRange]);

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
                const { error, path } = await uploadStudentAvatar(student.id, formData);
                if (error) {
                    toast({ title: "Erro no Upload", description: error, variant: "destructive" });
                    setAvatarPreview(student.avatar_url ?? null); // Revert on error
                } else {
                    toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada."});
                    router.refresh(); // Re-fetch server components to get new URL
                }
            });
        }
    };
    
    const handleLogout = async () => {
        await logoutStudent(student.id);
        router.push(`/public/student/${student.id}`);
        router.refresh();
    }

    const age = student.birth_date ? format(new Date(), 'yyyy') - format(new Date(student.birth_date), 'yyyy') : 'N/A';
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center bg-card p-6 rounded-lg shadow-sm">
                <div className="relative group">
                    <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                        <AvatarImage src={avatarPreview || student.avatar_url || undefined} alt={student.name} />
                        <AvatarFallback className="text-3xl">
                            {student.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                     <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-white"/> : <Upload className="h-6 w-6 text-white"/>}
                       <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                   </label>
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                    <p className="text-muted-foreground">{student.email}</p>
                    <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground pt-1 gap-4">
                        {student.phone && ( <div className="flex items-center"><Phone className="mr-2 h-4 w-4" /><span>{student.phone}</span></div>)}
                        {age !== 'N/A' && (<div className="flex items-center"><Cake className="mr-2 h-4 w-4"/><span>{age} anos</span></div>)}
                    </div>
                </div>
                 <Button onClick={handleLogout} variant="ghost" size="icon" className="shrink-0">
                    <Power className="h-5 w-5"/>
                    <span className="sr-only">Sair</span>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Planos de Treino</CardTitle>
                    <div className="pt-2">
                        <Input 
                            placeholder="Buscar por nome do plano..."
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
                            <DateRangeFilter onDateChange={setMeasurementsFilterRange} />
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
    );
}
