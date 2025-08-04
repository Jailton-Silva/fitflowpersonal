

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { Workout, Measurement, Student } from "@/lib/definitions";
import { cookies } from "next/headers";
import StudentPortalClient from "./client-page";
import { ThemeToggle } from "@/components/theme-toggle";

async function getStudentPortalData(studentId: string) {
    const supabase = createClient();
    
    // This function runs on the server, so we don't have access to the logged-in user's session
    // in the same way. We just fetch public-facing data.
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
        console.error("Error fetching student from server:", studentResult.error);
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
    // Authenticate the student for this specific portal page
    const cookieStore = cookies();
    const studentAuthCookie = cookieStore.get(`student-${params.id}-auth`);
    const student = await createClient().from("students").select("access_password").eq("id", params.id).single();

    // If there's a password, require authentication
    if (student.data?.access_password && studentAuthCookie?.value !== "true") {
        notFound();
    }
    
    const { student: studentData, workouts, measurements } = await getStudentPortalData(params.id);
    
    return (
        <div className="flex flex-col min-h-screen bg-muted">
            <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 no-print">
                <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline hidden sm:block">FitFlow Portal</h1>
                    </div>
                     <div className="flex items-center gap-2">
                         <ThemeToggle />
                    </div>
                </div>
            </header>
            
            <StudentPortalClient 
                student={studentData} 
                initialWorkouts={workouts} 
                initialMeasurements={measurements} 
            />

             <footer className="text-center py-4 text-muted-foreground text-xs no-print">
                <p>&copy; {new Date().getFullYear()} FitFlow. Potencializado por IA.</p>
            </footer>
        </div>
    );
}

