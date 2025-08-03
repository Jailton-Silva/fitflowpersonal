
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Workout, Measurement } from "@/lib/definitions";
import StudentPublicPortalClient from "./client-page";


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


export default async function StudentPublicPortalPage({ params }: { params: { id: string } }) {
    const { student, workouts, measurements } = await getStudentPortalData(params.id);
    
    return (
       <StudentPublicPortalClient 
        student={student} 
        initialWorkouts={workouts} 
        initialMeasurements={measurements} 
       />
    );
}
