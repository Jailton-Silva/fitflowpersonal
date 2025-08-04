
"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, Trophy, Upload, LogOut, Loader2, Dumbbell, Phone, Cake } from "lucide-react";
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
import { uploadStudentAvatar, logoutStudent } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


type StudentPortalClientProps = {
    student: Student;
    initialWorkouts?: Workout[];
    initialMeasurements?: Measurement[];
}


export default function StudentPortalClient({ student, initialWorkouts = [], initialMeasurements = [] }: StudentPortalClientProps) {
    
    // Filter states
    const [measurementsFilter, setMeasurementsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });
    const [workoutsFilter, setWorkoutsFilter] = useState<{ text: string; range?: DateRange }>({ text: "" });

    const [isUploading, startUploadTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url ?? null);
    const { toast } = useToast();
    const router = useRouter();


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
        const lowerCaseFilter = workoutsFilter.text.toLowerCase();
        return initialWorkouts.filter(w => w.name.toLowerCase().includes(lowerCaseFilter));
    }, [initialWorkouts, workoutsFilter]);
    
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
                  setAvatarPreview(student.avatar_url ?? null); // Revert on error
              } else {
                  toast({ title: "Sucesso!", description: "Avatar atualizado."});
              }
          });
        }
    };
    
    const age = student.birth_date ? format(new Date(), 'yyyy') - format(new Date(student.birth_date), 'yyyy') : 'N/A';

    return (
        <div className="flex flex-col min-h-screen bg-muted">
             <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 no-print">
                <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow Portal</h1>
                    </div>
                     <Button variant="ghost" size="sm" onClick={() => logoutStudent(student.id)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </header>
            <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center bg-card p-6 rounded-lg shadow-sm">
                        
                         <div className="relative group shrink-0">
                            <Avatar className="w-24 h-24 border-2 border-primary">
                                <AvatarImage src={avatarPreview || undefined} alt={student.name} />
                                <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                                <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploading}/>
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
                    </div>
                    
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center">
                                <Dumbbell className="mr-2"/> Meus Planos de Treino
                            </CardTitle>
                             <div className="pt-2">
                                <Input 
                                    placeholder="Buscar por nome do plano..."
                                    value={workoutsFilter.text}
                                    onChange={(e) => setWorkoutsFilter(prev => ({...prev, text: e.target.value}))}
                                    className="h-9 max-w-sm"
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
                                    <DateRangeFilter onDateChange={(range) => setMeasurementsFilter(prev => ({...prev, range}))} />
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
