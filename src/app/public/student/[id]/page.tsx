
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Student, Measurement } from "@/lib/definitions";
import { StudentPasswordForm } from "@/components/students/student-password-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, User, Weight } from "lucide-react";
import ProgressChart from "@/components/students/progress-chart";
import MeasurementsHistory from "@/components/students/measurements-history";

async function getStudentPublicData(studentId: string) {
    const supabase = createClient();

    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
    
    if (error || !student) {
        notFound();
    }
    
    // Check for authorization cookie
    const cookieStore = cookies();
    const isAuthorized = cookieStore.get(`student_access_${studentId}`)?.value === 'true';
    
    // If student has a password and user is not authorized, return only basic data
    if (student.access_password && !isAuthorized) {
        return { student, isAuthorized: false, measurements: [] };
    }

    const { data: measurements, error: measurementsError } = await supabase
        .from('measurements')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });

    if (measurementsError) {
        console.error("Erro ao buscar medições:", measurementsError);
    }

    return {
        student,
        isAuthorized: true,
        measurements: (measurements as Measurement[]) || [],
    }
}

export default async function StudentPublicPage({ params }: { params: { id: string } }) {
    const { student, isAuthorized, measurements } = await getStudentPublicData(params.id);

    if (!isAuthorized) {
        return <StudentPasswordForm studentId={student.id} />;
    }

    const latestWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight : student.weight;
    const latestBodyFat = measurements.length > 0 ? measurements[measurements.length - 1].body_fat : student.body_fat;

    return (
         <div className="flex flex-col min-h-screen bg-muted">
             <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow</h1>
                    </div>
                     <div className="flex items-center gap-2">
                         <ThemeToggle />
                    </div>
                </div>
            </header>
            <main className="flex-1 py-8 px-4">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <Avatar className="w-24 h-24 border-2 border-primary">
                            <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                            <AvatarFallback className="text-3xl">
                                {student.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-3xl font-bold font-headline">Portal de {student.name}</h1>
                            <p className="text-muted-foreground">Bem-vindo(a)! Acompanhe seu progresso aqui.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
                                <Weight className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{latestWeight || 'N/A'} kg</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">% de Gordura</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{latestBodyFat || 'N/A'}%</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Objetivo Principal</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm truncate pt-2">{student.goals || 'Não definido'}</p>
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

                    <Card>
                        <CardHeader>
                             <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Histórico de Medições</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MeasurementsHistory studentId={student.id} measurements={measurements} />
                        </CardContent>
                    </Card>
                </div>
            </main>
             <footer className="text-center py-4 text-muted-foreground text-xs">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    )
}
