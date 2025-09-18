
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import StudentDetailClient from "./client-page";

type EnrichedWorkoutSession = WorkoutSession & { workouts: { name: string } | null };

// 1. A responsabilidade deste Server Component agora é apenas buscar os dados.
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
        workouts: (workoutsResult.data as Workout[]) || [],
        measurements: (measurementsResult.data as Measurement[]) || [],
        sessions: (sessionsResult.data as EnrichedWorkoutSession[]) || [],
    }
}

// 2. O componente apenas busca os dados e os passa para o Client Component.
export default async function StudentDetailPage({ params }: { params: { id: string }}) {
    // CORREÇÃO: Extrai o id de params antes de usá-lo.
    const studentId = params.id;
    const { student, workouts, measurements, sessions } = await getStudentPageData(studentId);
    
    // 3. Toda a lógica de renderização foi movida para StudentDetailClient.
    return (
        <StudentDetailClient 
            student={student} 
            initialWorkouts={workouts} 
            initialMeasurements={measurements} 
            initialSessions={sessions}
        />
    );
}
