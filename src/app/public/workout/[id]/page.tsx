
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from 'next/headers'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Utensils, Video, CheckCircle, Flame } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutExercise, Exercise, Student, Workout, WorkoutSession } from "@/lib/definitions";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { getWorkoutSession, startWorkoutSession, getWorkoutDetails } from "./actions";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { ThemeToggle } from "@/components/theme-toggle";


const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl.includes('youtube.com/watch?v=')) {
        return <p>URL do vídeo inválida.</p>
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
        ></iframe>
    );
};

const StartWorkoutButton = ({ workoutId, studentId }: { workoutId: string; studentId: string }) => {
  const startWorkoutWithIds = startWorkoutSession.bind(null, workoutId, studentId);
  return (
    <form action={startWorkoutWithIds}>
      <Button type="submit" size="lg" className="w-full sm:w-auto ripple">
          <Flame className="mr-2 h-5 w-5" />
          Iniciar Treino Agora
      </Button>
    </form>
  )
}


export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const workout = await getWorkoutDetails(params.id);

    if (!workout) {
        notFound();
    }
    
    // Password check
    const cookieStore = cookies()
    const isVerified = cookieStore.get(`workout_auth_${workout.id}`)?.value === 'true'

    if (workout.access_password && !isVerified) {
        return <WorkoutPasswordForm workoutId={workout.id} />;
    }

    let session: WorkoutSession | null = null;
    if (workout.id && workout.student_id) {
        session = await getWorkoutSession(workout.id, workout.student_id);
    }

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
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
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
                            <Badge>Plano de Treino</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {workout.description && (
                             <div className="prose prose-sm max-w-none text-muted-foreground mb-6 whitespace-pre-wrap">
                               <p>{workout.description}</p>
                            </div>
                        )}
                        
                        {workout.diet_plan && (
                            <div className="mb-6 p-4 rounded-lg bg-muted/50">
                                <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Utensils className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                    <p>{workout.diet_plan}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h3 className="text-lg font-headline flex items-center gap-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                                {session && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 font-semibold p-2 rounded-md bg-green-500/10">
                                        <CheckCircle className="h-5 w-5" />
                                        <p>Treino iniciado em {format(new Date(session.started_at), "dd/MM/yy 'às' HH:mm", {locale: ptBR})}. Bom treino!</p>
                                    </div>
                                )}
                            </div>

                            {(!session && workout.student_id) && (
                                <div className="text-center py-8">
                                    <StartWorkoutButton workoutId={workout.id} studentId={workout.student_id} />
                                    <p className="text-muted-foreground text-sm mt-2">Clique para registrar o início da sua sessão.</p>
                                </div>
                            )}

                            {(workout.exercises as WorkoutExercise[]).map((exercise, index) => {
                                const isCompleted = !!session?.completed_exercises?.includes(exercise.exercise_id);
                                return (
                                <Card key={index} className="bg-muted/50 flex flex-col sm:flex-row">
                                    <CardHeader className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                                {exercise.name}
                                            </CardTitle>
                                             {exercise.video_url && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                            <Video className="h-4 w-4" />
                                                            Ver Vídeo
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle>{exercise.name}</DialogTitle>
                                                        </DialogHeader>
                                                        <VideoPlayer videoUrl={exercise.video_url} />
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex items-center gap-4 p-4 sm:p-6 w-full sm:w-auto">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1">
                                            <div><p className="font-semibold">Séries</p><p>{exercise.sets || '-'}</p></div>
                                            <div><p className="font-semibold">Repetições</p><p>{exercise.reps || '-'}</p></div>
                                            <div><p className="font-semibold">Carga</p><p>{exercise.load ? `${exercise.load} kg` : '-'}</p></div>
                                            <div><p className="font-semibold">Descanso</p><p>{exercise.rest ? `${exercise.rest} s` : '-'}</p></div>
                                        </div>
                                        {session && (
                                            <div className="pl-4 border-l">
                                                <ExerciseCheck 
                                                    sessionId={session.id} 
                                                    exerciseId={exercise.exercise_id} 
                                                    isCompleted={isCompleted}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

