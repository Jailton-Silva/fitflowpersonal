

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Utensils, Video, Lock, Trophy } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Workout, WorkoutSession } from "@/lib/definitions";
import { cookies } from "next/headers";
import { getWorkoutDetails, getWorkoutSession, startWorkoutSession } from "./actions";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    // Basic validation
    if (!videoUrl.includes('youtube.com/watch?v=')) {
        return <p className="text-sm text-red-500">URL do vídeo do YouTube inválida.</p>
    }
    const videoId = videoUrl.split('v=')[1].split('&')[0];
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
        <iframe
            width="100%"
            height="315"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
        ></iframe>
    );
};


export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const workoutId = params.id;
    const cookieStore = cookies();
    const supabase = createClient();
    
    const workout = await getWorkoutDetails(workoutId);

    if (!workout) {
        notFound();
    }
    
    // Password protection check
    if (workout.access_password) {
        const passwordCookie = cookieStore.get(`workout_access_${workoutId}`);
        if (passwordCookie?.value !== workout.access_password) {
            return <WorkoutPasswordForm workoutId={workoutId} />;
        }
    }
    
    if (!workout.student_id) {
         return (
            <div className="flex items-center justify-center min-h-screen bg-muted">
                <Card className="text-center p-8">
                    <CardTitle>Treino não associado</CardTitle>
                    <CardDescription>Este plano de treino ainda não foi associado a um aluno.</CardDescription>
                </Card>
            </div>
        )
    }

    let session: WorkoutSession | null = await getWorkoutSession(workoutId, workout.student_id);

    // If no session exists, start one.
    if (!session) {
        const newSession = await startWorkoutSession(workoutId, workout.student_id);
        if (newSession) {
            session = newSession;
        } else {
             return (
                <div className="flex items-center justify-center min-h-screen bg-muted">
                    <Card className="text-center p-8">
                        <CardTitle>Erro ao Iniciar Sessão</CardTitle>
                        <CardDescription>Não foi possível iniciar uma nova sessão de treino. Tente novamente mais tarde.</CardDescription>
                    </Card>
                </div>
            )
        }
    }

    const isWorkoutCompleted = !!session?.completed_at;
    const completedExercises = new Set(session?.completed_exercises || []);

    return (
        <div className="bg-background min-h-screen">
             <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Dumbbell className="h-6 w-6 text-primary" />
                <h1 className="ml-2 text-2xl font-headline font-bold text-primary">FitFlow</h1>
                <div className="ml-auto">
                    <ThemeToggle />
                </div>
            </header>
            <main className="p-4 md:p-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{workout.students?.name}</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                </CardDescription>
                            </div>
                            { isWorkoutCompleted ? 
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Concluído</Badge> 
                                : 
                                <Badge>Em Andamento</Badge> 
                            }
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isWorkoutCompleted ? (
                             <div className="text-center py-12 px-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex flex-col items-center">
                                <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
                                <h2 className="text-2xl font-bold font-headline">Parabéns!</h2>
                                <p className="text-muted-foreground mt-2 max-w-md">
                                    Você completou todos os exercícios deste treino. Continue com o ótimo trabalho e dedicação!
                                </p>
                            </div>
                        ) : (
                            <>
                                {workout.description && (
                                    <div className="prose prose-sm max-w-none text-muted-foreground mb-6 whitespace-pre-wrap">
                                        <p>{workout.description}</p>
                                    </div>
                                )}

                                {workout.diet_plan && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Utensils className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                                        <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap p-4 bg-muted/50 rounded-md">
                                            <p>{workout.diet_plan}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                                    {(workout.exercises as any[]).map((exercise, index) => (
                                        <div key={index} className={cn("p-4 rounded-lg flex items-start gap-4 transition-all", completedExercises.has(exercise.exercise_id) ? "bg-green-500/10 border-l-4 border-green-500" : "bg-muted/50")}>
                                            <div className="flex-shrink-0 mt-1">
                                                <ExerciseCheck 
                                                    sessionId={session!.id} 
                                                    exerciseId={exercise.exercise_id}
                                                    isCompleted={completedExercises.has(exercise.exercise_id)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className={cn("text-lg font-headline", completedExercises.has(exercise.exercise_id) && "line-through text-muted-foreground")}>
                                                        {exercise.name}
                                                    </h4>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                                    <div><p className="font-semibold">Séries</p><p>{exercise.sets || '-'}</p></div>
                                                    <div><p className="font-semibold">Repetições</p><p>{exercise.reps || '-'}</p></div>
                                                    <div><p className="font-semibold">Carga</p><p>{exercise.load ? `${exercise.load} kg` : '-'}</p></div>
                                                    <div><p className="font-semibold">Descanso</p><p>{exercise.rest ? `${exercise.rest} s` : '-'}</p></div>
                                                </div>
                                                {exercise.video_url && <VideoPlayer videoUrl={exercise.video_url} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
