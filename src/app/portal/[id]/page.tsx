
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Student, Workout, StudentMeasurement, WorkoutSession } from "@/lib/definitions";
import { cookies } from "next/headers";
import StudentDetailClient from "./student-detail-client";

async function getPortalData(studentId: string) {
    const supabase = await createClient();

    // Realiza todas as consultas em paralelo para melhor performance
    const [studentResult, workoutsResult, measurementsResult, sessionsResult] = await Promise.all([
        supabase.from('students').select('*').eq('id', studentId).single(),
        supabase.from('workouts').select('*').eq('student_id', studentId).in('status', ['active', 'not-started']).order('created_at', { ascending: false }),
        supabase.from('student_measurements').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
        supabase.from('workout_sessions').select('*, workouts(name)').eq('student_id', studentId).order('start_time', { ascending: false })
    ]);

    const { data: student, error: studentError } = studentResult;

    if (studentError || !student || student.status !== 'active') {
        if (studentError) console.error("Portal Error (Student Fetch):", studentError.message);
        notFound();
    }

    // Log de erros para depuração, sem interromper a execução
    if (workoutsResult.error) console.error("Portal Error (Workouts Fetch):", workoutsResult.error.message);
    if (measurementsResult.error) console.error("Portal Error (Measurements Fetch):", measurementsResult.error.message);
    if (sessionsResult.error) console.error("Portal Error (Sessions Fetch):", sessionsResult.error.message);

    return {
        student: student as Student,
        workouts: (workoutsResult.data as Workout[]) || [],
        measurements: (measurementsResult.data as StudentMeasurement[]) || [],
        sessions: (sessionsResult.data as WorkoutSession[]) || [],
    };
}

export default async function StudentPortalPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    
    const studentId = params.id;
    if (!studentId) {
        notFound();
    }

    const sessionCookie = cookieStore.get(`portal-session-${studentId}`);
    if (!sessionCookie) {
        redirect('/portal');
    }

    const { student, workouts, measurements, sessions } = await getPortalData(studentId);

    return <StudentDetailClient 
        student={student} 
        workouts={workouts} 
        measurements={measurements} 
        sessions={sessions} 
    />;
}
