
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { StudentPasswordForm } from "@/components/students/student-password-form";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import StudentDetailClient from "@/app/(app)/students/[id]/client-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

async function getStudentPortalData(studentId: string) {
    const supabase = createClient();

    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        notFound();
    }
    
    // Check for password authorization
    const cookieStore = cookies();
    const isAuthorized = cookieStore.get(`student_auth_${studentId}`)?.value === 'true';

    if (!isAuthorized) {
        return { student, isAuthorized: false, workouts: [], measurements: [], sessions: [] };
    }
    
    const workoutsPromise = supabase
        .from("workouts")
        .select("*, students (id, name)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

    const measurementsPromise = supabase
        .from('measurements')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });

    const sessionsPromise = supabase
        .from('workout_sessions')
        .select(`*, workouts (name)`)
        .eq('student_id', studentId)
        .order('started_at', { ascending: false });
    
    const [workoutsResult, measurementsResult, sessionsResult] = await Promise.all([
        workoutsPromise,
        measurementsPromise,
        sessionsPromise
    ]);

     if (workoutsResult.error) console.error("Erro ao buscar treinos:", workoutsResult.error);
     if (measurementsResult.error) console.error("Erro ao buscar medições:", measurementsResult.error);
     if (sessionsResult.error) console.error("Erro ao buscar sessões:", sessionsResult.error);

    return {
        student,
        isAuthorized: true,
        workouts: (workoutsResult.data as Workout[]) || [],
        measurements: (measurementsResult.data as Measurement[]) || [],
        sessions: (sessionsResult.data as EnrichedWorkoutSession[]) || [],
    }
}

export default async function StudentPortalPage({ params }: { params: { id: string } }) {
    const { student, isAuthorized, workouts, measurements, sessions } = await getStudentPortalData(params.id);

    if (!isAuthorized) {
        return <StudentPasswordForm studentId={params.id} />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow Aluno</h1>
                    </div>
                     <div className="flex items-center gap-2">
                         <ThemeToggle />
                    </div>
                </div>
            </header>

             <main className="flex-1 py-8 px-4">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start bg-card p-6 rounded-lg shadow-sm">
                        <Avatar className="w-24 h-24 border-2 border-primary">
                            <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                            <AvatarFallback className="text-3xl">
                                {student.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                                <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                {student.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">Bem-vindo(a) ao seu portal de acompanhamento!</p>
                        </div>
                    </div>
                    
                    <StudentDetailClient
                        student={student}
                        initialWorkouts={workouts}
                        initialMeasurements={measurements}
                        initialSessions={sessions}
                        isPublicView={true}
                    />
                </div>
            </main>

             <footer className="text-center py-4 text-muted-foreground text-xs">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}
