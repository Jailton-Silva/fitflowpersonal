
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Workout, StudentMeasurement, WorkoutSession, Student } from "@/lib/definitions";
import StudentDetailClient from "./client-page";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

async function getStudentPageData(studentId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        notFound();
    }
    const { data: trainer } = await supabase.from('trainers').select('id').eq('user_id', user.id).single();
    if (!trainer) {
        notFound();
    }

    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .eq('trainer_id', trainer.id) // Security check
        .single();

    if (error || !student) {
        notFound();
    }
    
    const workoutsPromise = supabase
        .from("workouts")
        .select("*, students (id, name)")
        .eq("student_id", studentId)
        .eq("trainer_id", trainer.id)
        .order("created_at", { ascending: false });

    // CORREÇÃO: Nome da tabela corrigido para 'measurements' e verificação de segurança RLS aplicada.
    const measurementsPromise = supabase
        .from('measurements') // NOME DA TABELA CORRIGIDO
        .select('*, students!inner(trainer_id)')
        .eq('student_id', studentId)
        .eq('students.trainer_id', trainer.id) 
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
     if (sessionsResult.error) console.error("Erro ao buscar sessões:", sessionsResult.error.message);

    return {
        student,
        workouts: (workoutsResult.data as Workout[]) || [],
        measurements: (measurementsResult.data as StudentMeasurement[]) || [],
        sessions: (sessionsResult.data as EnrichedWorkoutSession[]) || [],
    }
}

export default async function StudentDetailPage({ params }: { params: { id: string }}) {
    const studentId = params.id;
    const { student, workouts, measurements, sessions } = await getStudentPageData(studentId);
    
    return (
        <StudentDetailClient 
            student={student} 
            initialWorkouts={workouts} 
            initialMeasurements={measurements} 
            initialSessions={sessions}
        />
    );
}
