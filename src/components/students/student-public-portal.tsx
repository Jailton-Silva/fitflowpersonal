
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import StudentPortalClient from "@/app/portal/[id]/student-detail-client";
import { cookies } from "next/headers";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

async function getStudentPortalData(studentId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const studentPromise = supabase.from('students').select('*').eq('id', studentId).single();
    
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

    const [studentResult, workoutsResult, measurementsResult, sessionsResult] = await Promise.all([
        studentPromise,
        workoutsPromise,
        measurementsPromise,
        sessionsPromise
    ]);

     if (studentResult.error || !studentResult.data) {
        notFound();
     }
     if (workoutsResult.error) console.error("Erro ao buscar treinos:", workoutsResult.error);
     if (measurementsResult.error) console.error("Erro ao buscar medições:", measurementsResult.error);
     if (sessionsResult.error) console.error("Erro ao buscar sessões:", sessionsResult.error);

    return {
        student: studentResult.data as Student,
        workouts: (workoutsResult.data as Workout[]) || [],
        measurements: (measurementsResult.data as Measurement[]) || [],
        sessions: (sessionsResult.data as EnrichedWorkoutSession[]) || [],
    }
}


export async function StudentPublicPortal({ studentId }: { studentId: string }) {
    const { student, workouts, measurements, sessions } = await getStudentPortalData(studentId);
    
    return (
        <StudentPortalClient
            student={student} 
            workouts={workouts}
            measurements={measurements}
            sessions={sessions}
        />
    );
}
