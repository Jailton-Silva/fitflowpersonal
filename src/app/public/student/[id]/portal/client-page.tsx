
"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, User, Dumbbell, Shield, Upload, Loader2 } from "lucide-react";
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
import { uploadStudentAvatar } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
}


export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [] }: StudentPortalClientProps) {
    const [workouts, setWorkouts] = useState(initialWorkouts);
    const [measurements, setMeasurements] = useState(initialMeasurements);
    const [isUploading, startUploadTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();


    // Filter states
    const [workoutsFilter, setWorkoutsFilter] = useState("");
    const [measurementsFilter, setMeasurementsFilter] = useState<{ range?: DateRange }>({ range: undefined });

    const filteredWorkouts = useMemo(() => {
        const lowerCaseFilter = workoutsFilter.toLowerCase();
        if (!lowerCaseFilter) return workouts;
        return workouts.filter(w => w.name.toLowerCase().includes(lowerCaseFilter));
    }, [workouts, workoutsFilter]);

    const filteredMeasurements = useMemo(() => {
        const fromDate = measurementsFilter.range?.from ? new Date(measurementsFilter.range.from.setHours(0,0,0,0)) : null;
        const toDate = measurementsFilter.range?.to ? new Date(measurementsFilter.range.to.setHours(23,59,59,999)) : null;

        return measurements.filter(m => {
            const itemDate = parseISO(m.created_at);
            const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            return dateMatch;
        });
    }, [measurements, measurementsFilter]);
    
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
                  // router.refresh() is not needed here because revalidatePath is called in the server action
              }
          });
        }
    };


    // Renders the page content
    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                     {/* Profile Header */}
                    <Card>
                        <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
                            <div className="relative">
                                <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                                    <AvatarFallback className="text-3xl">
                                        {student.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {isUploading && (
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold font-headline">{student.name}</h1>
                                <p className="text-muted-foreground">{student.email}</p>
                                <Button asChild variant="outline" size="sm" className="mt-4">
                                   <label htmlFor="avatar-upload" className="cursor-pointer">
                                       <Upload className="mr-2 h-4 w-4"/> Alterar Foto
                                       <Input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                                   </label>
                               </Button>
                            </div>
                             <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-center sm:text-left">
                                <div><strong className="block text-muted-foreground">Altura</strong> {student.height ? `${student.height} cm` : 'N/A'}</div>
                                <div><strong className="block text-muted-foreground">Peso</strong> {student.weight ? `${student.weight} kg` : 'N/A'}</div>
                                <div><strong className="block text-muted-foreground">Idade</strong> {student.birth_date ? `${format(new Date(), 'yyyy') - format(new Date(student.birth_date), 'yyyy')} anos` : 'N/A'}</div>
                             </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                             <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Planos de Treino</CardTitle>
                                </div>
                                 <div className="pt-2">
                                     <Input 
                                        placeholder="Buscar por nome do plano..."
                                        value={workoutsFilter}
                                        onChange={(e) => setWorkoutsFilter(e.target.value)}
                                        className="h-9"
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
                                                   <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                               </div>
                                               <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/public/workout/${workout.id}`}>
                                                        Acessar Treino
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
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-headline flex items-center"><User className="mr-2"/> Meus Objetivos</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent><p className="text-sm text-muted-foreground">{student.goals || "Nenhum objetivo definido."}</p></CardContent>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2"/> Obs. Saúde</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent><p className="text-sm text-muted-foreground">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent>
                        </Card>
                        <Card className="lg:col-span-2">
                             <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                    <CardTitle className="text-lg font-headline flex items-center"><CalendarIcon className="mr-2"/> Minhas Avaliações Físicas</CardTitle>
                                    <DateRangeFilter
                                        onDateChange={(range) => setMeasurementsFilter({ range })}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent><MeasurementsHistory studentId={student.id} measurements={filteredMeasurements} isPublicView={true} /></CardContent>
                        </Card>
                        <Card className="lg:col-span-2">
                            <CardHeader><CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Gráfico de Evolução Física</CardTitle></CardHeader>
                            <CardContent><ProgressChart measurements={filteredMeasurements} /></CardContent>
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
