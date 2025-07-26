
import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cookies } from "next/headers";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutExercise } from "@/lib/definitions";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { Button } from "@/components/ui/button";

async function getWorkoutForPublic(workoutId: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: workout, error } = await supabase
        .from('workouts')
        .select('*, students(name)')
        .eq('id', workoutId)
        .single();

    if (error) {
        console.error(`[ Server ] Error fetching workout:`, error);
        return null;
    }
    
    if (!workout || !workout.exercises || workout.exercises.length === 0) {
        return workout;
    }

    const exerciseIds = workout.exercises.map(e => e.exercise_id);
    
    const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds);

    if (exercisesError) {
        console.error(`[ Server ] Error fetching exercises:`, exercisesError);
        // We can still proceed without video_urls
        return workout;
    }

    const exercisesWithDetails = workout.exercises.map(woExercise => {
        const fullExercise = exercises.find(dbEx => dbEx.id === woExercise.exercise_id);
        return {
            ...woExercise,
            video_url: fullExercise?.video_url || undefined,
        };
    });

    return { ...workout, exercises: exercisesWithDetails };
}

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


export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const workoutId = params.id;
    const cookieStore = cookies();
    const workout = await getWorkoutForPublic(workoutId);

    if (!workout) {
        notFound();
    }

    // Password protection check
    const hasAccess = cookieStore.get(`workout_access_${workoutId}`)?.value === 'true';

    if (workout.access_password && !hasAccess) {
        return <WorkoutPasswordForm workoutId={workoutId} />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 md:p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                            <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2">
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Aluno: {workout.students?.name ?? 'N/A'}
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
                         <div className="prose prose-sm max-w-none text-muted-foreground mb-6 p-4 bg-muted/50 rounded-lg">
                           <p className="whitespace-pre-wrap">{workout.description}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                        {(workout.exercises as WorkoutExercise[]).map((exercise, index) => (
                             <Card key={index} className="bg-muted/50">
                                <CardHeader>
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <ExerciseCheck exerciseId={`${workout.id}-${exercise.exercise_id}`} />
                                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                                {exercise.name}
                                            </CardTitle>
                                        </div>
                                        {exercise.video_url && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="flex items-center gap-2 ripple">
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
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ml-10">
                                        <div>
                                            <p className="font-semibold text-muted-foreground">Séries</p>
                                            <p className="font-bold text-lg">{exercise.sets || '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold text-muted-foreground">Repetições</p>
                                            <p className="font-bold text-lg">{exercise.reps || '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold text-muted-foreground">Carga</p>
                                            <p className="font-bold text-lg">{exercise.load ? `${exercise.load} kg` : '-'}</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold text-muted-foreground">Descanso</p>
                                            <p className="font-bold text-lg">{exercise.rest ? `${exercise.rest} s` : '-'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <footer className="text-center mt-8">
                <p className="text-xs text-muted-foreground">
                    Fornecido por FitFlow - {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
