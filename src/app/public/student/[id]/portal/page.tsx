
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Cake, Ruler, Weight, Dumbbell, Shield, Activity, History as HistoryIcon, BarChart } from "lucide-react";
import { format, differenceInYears } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import MeasurementsHistory from "@/components/students/measurements-history";
import ProgressChart from "@/components/students/progress-chart";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

async function getStudentPageData(studentId: string) {
    const supabase = createClient();

    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        notFound();
    }
    
    const workoutsPromise = supabase
        .from("workouts")
        .select("id, name, created_at, exercises")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

    const measurementsPromise = supabase
        .from('measurements')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });
    
    const [workoutsResult, measurementsResult] = await Promise.all([
        workoutsPromise,
        measurementsPromise,
    ]);

     if (workoutsResult.error) console.error("Erro ao buscar treinos:", workoutsResult.error);
     if (measurementsResult.error) console.error("Erro ao buscar medições:", measurementsResult.error);

    return {
        student,
        workouts: (workoutsResult.data as Omit<Workout, 'students'>[]) || [],
        measurements: (measurementsResult.data as Measurement[]) || [],
    }
}


export default async function StudentPortalPage({ params }: { params: { id: string }}) {
    const { student, workouts, measurements } = await getStudentPageData(params.id);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';
    
    return (
        <div className="flex flex-col min-h-screen bg-muted">
             <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 no-print">
                <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow Portal</h1>
                    </div>
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                     <section className="bg-card rounded-xl shadow-lg p-6 sm:p-8">
                         <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                                <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                                <AvatarFallback className="text-3xl">
                                    {student.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                                <p className="text-muted-foreground">{student.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg"><Cake className="h-5 w-5 text-primary"/><div><p className="text-sm text-muted-foreground">Idade</p><p className="font-semibold">{age} anos</p></div></div>
                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg"><Ruler className="h-5 w-5 text-primary"/><div><p className="text-sm text-muted-foreground">Altura</p><p className="font-semibold">{student.height ? `${student.height} cm` : 'N/A'}</p></div></div>
                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg"><Weight className="h-5 w-5 text-primary"/><div><p className="text-sm text-muted-foreground">Peso</p><p className="font-semibold">{student.weight ? `${student.weight} kg` : 'N/A'}</p></div></div>
                        </div>
                     </section>
                     
                     <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
                            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                            <TabsTrigger value="workouts">Meus Treinos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell /> Objetivos</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p></CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Shield /> Observações de Saúde</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent>
                                </Card>
                                <Card className="lg:col-span-2">
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Activity /> Histórico de Medições</CardTitle></CardHeader>
                                    <CardContent><MeasurementsHistory studentId={student.id} measurements={measurements} isPublicView={true} /></CardContent>
                                </Card>
                                <Card className="lg:col-span-2">
                                    <CardHeader><CardTitle className="flex items-center gap-2"><BarChart /> Gráfico de Evolução Física</CardTitle></CardHeader>
                                    <CardContent><ProgressChart measurements={measurements} /></CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="workouts">
                            <div className="space-y-4 mt-6">
                                {workouts.length > 0 ? workouts.map(workout => (
                                    <a href={`/public/workout/${workout.id}`} key={workout.id} className="block bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold font-headline">{workout.name}</p>
                                                <p className="text-sm text-muted-foreground">{(workout.exercises as any[]).length} exercícios</p>
                                            </div>
                                            <Badge variant="secondary">Ver Treino</Badge>
                                        </div>
                                    </a>
                                )) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                        <h2 className="text-xl font-semibold">Nenhum Treino Encontrado</h2>
                                        <p className="text-muted-foreground mt-2">
                                            Seu treinador ainda não adicionou nenhum plano de treino para você.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>
            </main>
             <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}
