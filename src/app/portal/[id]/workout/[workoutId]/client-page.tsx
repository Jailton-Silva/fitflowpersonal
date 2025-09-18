
"use client";

import { Student, Workout } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// A interface de props agora é mais simples, sem senhas.
interface WorkoutClientPageProps {
    student: Pick<Student, 'id' | 'name' | 'avatar_url'>;
    workout: Workout;
}

// Este é um componente de cliente apenas para exibição.
export default function WorkoutClientPage({ student, workout }: WorkoutClientPageProps) {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-2xl">{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    {/* Link para voltar à lista de treinos do portal do aluno */}
                    <Button variant="link" asChild className="p-0 h-auto text-sm text-muted-foreground">
                         <Link href={`/portal/${student.id}`}>&larr; Voltar para a lista de treinos</Link>
                    </Button>
                    <h1 className="text-2xl font-bold font-headline">{workout.name}</h1>
                </div>
            </header>

            <main>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Dumbbell /> Exercícios</CardTitle>
                        {workout.description && <p className="text-muted-foreground pt-2 text-sm font-normal">{workout.description}</p>}
                    </CardHeader>
                    <CardContent>
                         {/* Renderiza diretamente a lista de exercícios, sem nenhuma verificação de senha */}
                        <div className="space-y-4">
                            {(workout.exercises as any[]).map((exercise: any, index: number) => (
                                <div key={index} className="p-4 border rounded-lg bg-background">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-semibold text-lg flex-1 pr-2">{exercise.name}</h4>
                                        {exercise.video_url && (
                                            <Button asChild variant="outline" size="sm">
                                                <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1"><Video className="h-4 w-4"/> Ver vídeo</a>
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                        <div><strong>Séries:</strong> {exercise.sets || '-'}</div>
                                        <div><strong>Reps:</strong> {exercise.reps || '-'}</div>
                                        <div><strong>Carga:</strong> {exercise.load || '-'}</div>
                                        <div><strong>Descanso:</strong> {exercise.rest ? `${exercise.rest}s` : '-'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>

             <footer className="text-center text-xs text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} FitFlow. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
