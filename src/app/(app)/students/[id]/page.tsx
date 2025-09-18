
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Cake, Ruler, Weight, Dumbbell, Shield, Phone, Edit } from "lucide-react";
import { format, differenceInYears } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Workout, Measurement, WorkoutSession, Student } from "@/lib/definitions";
import StudentDetailClient from "./client-page";
import StudentForm from "@/components/students/student-form";
import { Button } from "@/components/ui/button";
import CopyPortalLinkButton from "@/components/students/copy-portal-link-button"; // Importando o novo componente

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


export default async function StudentDetailPage({ params }: { params: { id: string }}) {
    const { student, workouts, measurements, sessions } = await getStudentPageData(params.id);

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 border-2 border-primary shrink-0">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-3xl">
                        {student.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{student.email}</p>
                     {student.phone && (
                        <div className="flex items-center text-sm text-muted-foreground pt-1">
                           <Phone className="mr-2 h-4 w-4" />
                            <span>{student.phone}</span>
                        </div>
                    )}
                </div>
                 <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                    <StudentForm student={student}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Aluno
                        </Button>
                    </StudentForm>
                    <CopyPortalLinkButton studentId={student.id} />
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader><CardTitle className="text-lg font-headline flex items-center"><User className="mr-2"/> Detalhes Pessoais</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center"><Cake className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Idade:</strong><span className="ml-2">{age} anos</span></div>
                         <div className="flex items-center"><Ruler className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Altura:</strong><span className="ml-2">{student.height ? `${student.height} cm` : 'N/A'}</span></div>
                        <div className="flex items-center"><Weight className="mr-2 h-4 w-4 text-muted-foreground"/><strong>Peso Atual:</strong><span className="ml-2">{student.weight ? `${student.weight} kg` : 'N/A'}</span></div>
                    </CardContent>
                </Card>
                 <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Objetivos</CardTitle></CardHeader><CardContent><p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p></CardContent></Card>
                 <Card><CardHeader><CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2"/> Obs. Saúde</CardTitle></CardHeader><CardContent><p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p></CardContent></Card>
            </div>
            
            <StudentDetailClient
                student={student}
                initialWorkouts={workouts}
                initialMeasurements={measurements}
                initialSessions={sessions}
            />
        </div>
    );
}
