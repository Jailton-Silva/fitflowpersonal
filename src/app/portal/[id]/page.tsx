
import { notFound, redirect } from "next/navigation";
import { Student, Workout, StudentMeasurement, WorkoutSession } from "@/lib/definitions";
import { cookies } from "next/headers";
import StudentDetailClient from "./student-detail-client";

// ***** MOCK DATA PARA DEPURAÇÃO *****
const mockStudent: Student = {
    id: 'cbc5f6c9-a395-4633-9100-b9b80da84d3c',
    name: 'Aluno de Teste',
    email: 'teste@example.com',
    status: 'active',
    avatar_url: 'https://placehold.co/100x100',
    contact_phone: '(11) 99999-8888',
    gender: 'Masculino',
    birth_date: '1990-01-15T00:00:00.000Z',
    goals: 'Ganhar massa muscular.',
    observations: 'Aluno dedicado.',
    theme_preference: 'dark',
    trainer_id: 'some-trainer-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const mockWorkouts: Workout[] = [
    { id: 'workout-1', name: 'Treino A - Peito e Tríceps', description: 'Foco em força', student_id: mockStudent.id, status: 'active', exercises: [], created_at: new Date().toISOString() },
    { id: 'workout-2', name: 'Treino B - Costas e Bíceps', description: 'Foco em hipertrofia', student_id: mockStudent.id, status: 'active', exercises: [], access_password: '123', created_at: new Date().toISOString() }
];

const mockMeasurements: StudentMeasurement[] = [
    { id: 'm-1', student_id: mockStudent.id, weight: 80, height: 180, body_fat_percentage: 15, created_at: '2024-08-01T10:00:00Z' },
    { id: 'm-2', student_id: mockStudent.id, weight: 81.5, height: 180, body_fat_percentage: 14.5, created_at: '2024-09-01T10:00:00Z' }
];

const mockSessions: (WorkoutSession & { workouts: { name: string } | null })[] = [
    { id: 's-1', student_id: mockStudent.id, workout_id: 'workout-1', start_time: '2024-09-17T18:00:00Z', end_time: null, status: 'in-progress', created_at: new Date().toISOString(), workouts: { name: 'Treino A - Peito e Tríceps' } },
    { id: 's-2', student_id: mockStudent.id, workout_id: 'workout-2', start_time: '2024-09-15T18:00:00Z', end_time: '2024-09-15T19:00:00Z', status: 'completed', created_at: new Date().toISOString(), workouts: { name: 'Treino B - Costas e Bíceps' } }
];
// ***** FIM DO MOCK DATA *****


export default async function StudentPortalPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    
    const studentId = params.id;
    if (!studentId) {
        notFound();
    }

    // Verificação de segurança (mantida)
    const sessionCookie = cookieStore.get(`portal-session-${studentId}`);
    if (!sessionCookie) {
        redirect('/portal');
    }

    // A busca de dados real no Supabase foi desativada temporariamente.
    // const { student, workouts, measurements, sessions } = await getPortalData(studentId);

    // Usando os dados MOCK para renderizar o componente.
    return <StudentDetailClient 
        student={mockStudent} 
        workouts={mockWorkouts} 
        measurements={mockMeasurements} 
        sessions={mockSessions} 
    />;
}
