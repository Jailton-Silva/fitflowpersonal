
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, ArrowLeft, Utensils } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workout } from "@/lib/definitions";
import WorkoutDetailClient from "./client-page";
import { WorkoutExerciseCard, WorkoutExerciseRow, WorkoutExerciseHeader } from "@/components/workouts/workout-exercise-list";

async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        notFound();
    }
    const { data: trainer } = await supabase.from('trainers').select('id').eq('user_id', user.id).single();
    if (!trainer) {
        notFound();
    }

    const { data, error } = await supabase
        .from('workouts')
        .select(
            '*, students(id, name)'
        )
        .eq('id', workoutId)
        .eq('trainer_id', trainer.id) // Security check
        .single();

    if (error || !data) {
        notFound();
    }
    
    // Check workout status for public access
    if (data.status === 'inactive') {
        // Here you might want to redirect or show a specific "inactive" page
        // For now, we'll just prevent access by showing not found
        // A better implementation would be a proper "This workout is inactive" page
        notFound();
    }

    return data as Workout;
}


export default async function WorkoutDetailPage({ params }: { params: { id: string } }) {
    const workout = await getWorkoutDetails(params.id);
    const exercises = (workout.exercises as any[]) || [];

    return (
        <div className="space-y-6" id="printable-area">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 no-print">
                 <Button variant="outline" asChild>
                    <Link href="/workouts">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Treinos
                    </Link>
                </Button>
                <WorkoutDetailClient workout={workout} />
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                            <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                {workout.students?.id ? (
                                    <Link href={`/students/${workout.students.id}`} className="flex items-center gap-2 hover:underline">
                                        <User className="h-4 w-4" />
                                        <span>{workout.students.name}</span>
                                    </Link>
                                ) : (
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>Aluno não encontrado</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Criado em {format(new Date(workout.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </span>
                            </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">Plano de Treino</Badge>
                             <Badge variant={workout.status === 'active' ? 'default' : 'secondary'}>
                                {workout.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {workout.description && (
                        <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                           <p>{workout.description}</p>
                        </div>
                    )}

                    {workout.diet_plan && (
                        <div>
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Utensils className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                             <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                               <p>{workout.diet_plan}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-headline flex items-center gap-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                        
                        {/* Mobile View */}
                        <div className="md:hidden">
                            <div className="space-y-3">
                                {exercises.length > 0 ? (
                                    exercises.map((exercise, index) => <WorkoutExerciseCard key={index} workout={workout} exercise={exercise} />)
                                ) : (
                                    <p className="p-4 text-center text-muted-foreground">Nenhum exercício neste plano.</p>
                                )}
                            </div>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block rounded-md border">
                            <table className="w-full text-sm">
                                <WorkoutExerciseHeader />
                                <tbody className="divide-y divide-border">
                                    {exercises.length > 0 ? (
                                        exercises.map((exercise, index) => <WorkoutExerciseRow key={index} workout={workout} exercise={exercise} />)
                                    ) : (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                            Nenhum exercício neste plano.
                                        </td>
                                    </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
