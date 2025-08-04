
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Cake, Ruler, Weight, Dumbbell, Shield, Phone, Activity, History, Calendar as CalendarIcon, Utensils, ArrowLeft, Trophy } from "lucide-react";
import { format, differenceInYears } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import MeasurementsHistory from "./measurements-history";
import Link from "next/link";
import { Button } from "../ui/button";
import ProgressChart from "./progress-chart";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

async function getStudentPortalData(studentId: string) {
    const supabase = createClient();
    
    const studentPromise = supabase.from('students').select('*').eq('id', studentId).single();
    
    const workoutsPromise = supabase
        .from("workouts")
        .select("*, students (id, name)")
        .eq("student_id", studentId)
        .eq("status", "active") // Only show active workouts
        .order("created_at", { ascending: false });

    const measurementsPromise = supabase
        .from('measurements')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });
    
    const [studentResult, workoutsResult, measurementsResult] = await Promise.all([
        studentPromise,
        workoutsPromise,
        measurementsPromise
    ]);

     if (studentResult.error || !studentResult.data) {
        notFound();
     }
     if (workoutsResult.error) console.error("Erro ao buscar treinos:", workoutsResult.error);
     if (measurementsResult.error) console.error("Erro ao buscar medições:", measurementsResult.error);

    return {
        student: studentResult.data,
        workouts: (workoutsResult.data as Workout[]) || [],
        measurements: (measurementsResult.data as Measurement[]) || [],
    }
}


export default async function StudentPublicPortal({ studentId }: { studentId: string }) {
    const { student, workouts, measurements } = await getStudentPortalData(studentId);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';
    
    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 no-print">
                <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow Portal</h1>
                    </div>
                </div>
            </header>
             <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center bg-card p-6 rounded-lg shadow-sm">
                        <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                            <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                            <AvatarFallback className="text-3xl">
                                {student.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
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
                            <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Meus Planos de Treino</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {workouts.length > 0 ? (
                                <div className="space-y-3">
                                    {workouts.map((workout) => (
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
                                <p className="text-muted-foreground text-center py-4">Nenhum plano de treino atribuído a você no momento.</p>
                            )}
                        </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Minhas Avaliações Físicas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MeasurementsHistory studentId={student.id} measurements={measurements} isPublicView={true} />
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
                           <ProgressChart measurements={measurements} />
                        </CardContent>
                    </Card>

                </div>
            </main>
             <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
