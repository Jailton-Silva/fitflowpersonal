import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Cake, Ruler, Weight, Dumbbell, Shield, Activity, CalendarIcon, Phone } from "lucide-react";
import { format, differenceInYears } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workout } from "@/lib/definitions";

async function getStudentData(studentId: string) {
    const supabase = createClient();
    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        return null;
    }
    return student;
}

async function getStudentWorkouts(studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
    
    if (error) {
        console.error("Erro ao buscar treinos do aluno:", error);
        return [];
    }
    return data;
}


export default async function StudentDetailPage({ params }: { params: { id: string } }) {
    const student = await getStudentData(params.id);
    const workouts = await getStudentWorkouts(params.id);

    if (!student) {
        notFound();
    }

    const age = student.birth_date ? differenceInYears(new Date(), new Date(student.birth_date)) : 'N/A';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 border-2 border-primary">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-3xl">
                        {student.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{student.email}</p>
                     {student.phone && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                           <Phone className="mr-2 h-4 w-4" />
                            <span>{student.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><User className="mr-2"/> Detalhes Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center">
                            <Cake className="mr-2 h-4 w-4 text-muted-foreground"/>
                            <strong>Idade:</strong>
                            <span className="ml-2">{age} anos</span>
                        </div>
                         <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground"/>
                            <strong>Nascimento:</strong>
                            <span className="ml-2">{student.birth_date ? format(new Date(student.birth_date), 'dd/MM/yyyy') : 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <Ruler className="mr-2 h-4 w-4 text-muted-foreground"/>
                            <strong>Altura:</strong>
                            <span className="ml-2">{student.height ? `${student.height} cm` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <Weight className="mr-2 h-4 w-4 text-muted-foreground"/>
                            <strong>Peso:</strong>
                            <span className="ml-2">{student.weight ? `${student.weight} kg` : 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Dumbbell className="mr-2"/> Objetivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{student.goals || "Nenhum objetivo definido."}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Shield className="mr-2"/> Saúde</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{student.medical_conditions || "Nenhuma condição médica informada."}</p>
                    </CardContent>
                </Card>
            </div>
             <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Activity className="mr-2"/> Evolução Física</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Em breve: Gráficos de progresso aqui.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><CalendarIcon className="mr-2"/> Treinos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {workouts.length > 0 ? (
                           <ul className="space-y-3">
                               {workouts.map((workout: Workout) => (
                                   <li key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                       <div>
                                           <p className="font-semibold">{workout.name}</p>
                                           <p className="text-sm text-muted-foreground">{workout.exercises.length} exercícios</p>
                                       </div>
                                       <Button variant="outline" size="sm" asChild>
                                           <Link href={`/workouts/${workout.id}`}>Ver Plano</Link>
                                       </Button>
                                   </li>
                               ))}
                           </ul>
                       ) : (
                           <p className="text-muted-foreground">Nenhum treino recente encontrado.</p>
                       )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
