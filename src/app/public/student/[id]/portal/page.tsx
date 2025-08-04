
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Workout, Measurement, Student } from "@/lib/definitions";
import StudentPortalClient from "./client-page";
import { Dumbbell } from "lucide-react";


async function getStudentPortalData(studentId: string) {
    const supabase = createClient();
    
    const studentPromise = supabase.from('students').select('*').eq('id', studentId).single();
    
    const workoutsPromise = supabase
        .from("workouts")
        .select("*, students (id, name)")
        .eq("student_id", studentId)
        .eq("status", "active") 
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


export default async function StudentPublicPortalPage({ params }: { params: { id: string } }) {
    const { student, workouts, measurements } = await getStudentPortalData(params.id);
    
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
                <StudentPortalClient 
                    student={student} 
                    initialWorkouts={workouts} 
                    initialMeasurements={measurements} 
                />
            </main>
             <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}
