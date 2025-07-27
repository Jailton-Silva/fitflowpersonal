
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Utensils, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutExercise, Exercise, Student, Workout, WorkoutSession } from "@/lib/definitions";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { getWorkoutDetails, getWorkoutSession, startWorkoutSession, verifyPassword } from "./actions";


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


export default async function PublicWorkoutPage({ params, searchParams }: { params: { id: string }, searchParams: { token?: string } }) {
    const workout = await getWorkoutDetails(params.id);

    if (!workout) {
        notFound();
    }
    
    // Password protection check
    if (workout.access_password) {
        const hasAccess = await verifyPassword(workout.id, searchParams.token);
        if (!hasAccess) {
            return <WorkoutPasswordForm workoutId={workout.id} />;
        }
    }

    let session: WorkoutSession | null = null;
    if (workout.id && workout.student_id) {
        session = await getWorkoutSession(workout.id, workout.student_id);
    }
   
    if (!session && workout.id && workout.student_id) {
       session = await startWorkoutSession(workout.id, workout.student_id);
    }
    
    if (!session) {
       // This can happen if the workout is not associated with a student
       // Or if there was an error creating the session. We'll proceed without session features.
       console.log(`Could not get or create a session for workout ${workout.id}. Proceeding without it.`);
    }

    const completedExercisesSet = new Set(session?.completed_exercises || []);

    return (
        <main className="container mx-auto p-4 md:p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{(workout.students as any)?.name}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {workout.description && (
                        <div className="prose prose-sm max-w-none text-muted-foreground mb-6 whitespace-pre-wrap">
                           <p>{workout.description}</p>
                        </div>
                    )}
                     {workout.diet_plan && (
                        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Utensils className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                             <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                               <p>{workout.diet_plan}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                        {(workout.exercises as any[]).map((exercise, index) => (
                             <Card key={index} className="bg-muted/50 flex items-start p-4 gap-4">
                                {session && (
                                     <ExerciseCheck
                                        sessionId={session.id}
                                        exerciseId={exercise.exercise_id}
                                        isCompleted={completedExercisesSet.has(exercise.exercise_id)}
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold">{exercise.name}</h4>
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
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="font-semibold text-muted-foreground">Séries</p>
                                            <p>{exercise.sets || '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold text-muted-foreground">Repetições</p>
                                            <p>{exercise.reps || '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold text-muted-foreground">Carga</p>
                                            <p>{exercise.load ? `${exercise.load} kg` : '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold text-muted-foreground">Descanso</p>
                                            <p>{exercise.rest ? `${exercise.rest} s` : '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
