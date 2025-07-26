
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutExercise, Exercise, Student, Workout } from "@/lib/definitions";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { getWorkoutSession, startWorkoutSession } from "./actions";


async function getWorkoutForPublic(supabase: ReturnType<typeof createClient>, workoutId: string) {
    const { data, error } = await supabase
        .from('workouts')
        .select(`*, students ( id, name )`)
        .eq('id', workoutId)
        .single();
    
    if (error) console.error("[ Server ] Error fetching workout:", error);
    return data as Workout | null;
}

async function getFullExercises(supabase: ReturnType<typeof createClient>, exerciseIds: string[]): Promise<Exercise[]> {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds);

    if (error) {
        console.error("[ Server ] Error fetching exercise details:", error);
        return [];
    }
    return data;
}

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl.includes('youtube.com/watch?v=')) {
        return <p>URL do vídeo inválida.</p>
    }
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (!videoId) return <p>ID do vídeo não encontrado.</p>
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
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const workout = await getWorkoutForPublic(supabase, workoutId);

    if (!workout) {
        notFound();
    }
    
    const password = workout.access_password;
    const hasAccess = !password || (password && cookieStore.get(`workout_access_${workoutId}`)?.value === 'true');

    if (!hasAccess) {
        return <WorkoutPasswordForm workoutId={workoutId} />;
    }

    const exerciseIds = workout.exercises.map(e => e.exercise_id);
    const exerciseDetails = await getFullExercises(supabase, exerciseIds);

    const combinedExercises = workout.exercises.map(workoutExercise => {
        const details = exerciseDetails.find(d => d.id === workoutExercise.exercise_id);
        return {
            ...workoutExercise,
            video_url: details?.video_url,
        };
    });

    let session = await getWorkoutSession(workout.id, workout.student_id);
    if (!session) {
      session = await startWorkoutSession(workout.id, workout.student_id);
    }
    const completedExercises = session?.completed_exercises as string[] || [];


    return (
        <main className="bg-background min-h-screen">
             <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2 text-base">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Aluno: {workout.students?.name ?? 'Não identificado'}
                                    </span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {workout.description && (
                            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                            <p>{workout.description}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-xl font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                            {combinedExercises.map((exercise, index) => (
                                <Card key={index} className="bg-muted/50 p-4 flex flex-col sm:flex-row gap-4">
                                    <ExerciseCheck
                                        sessionId={session.id}
                                        exerciseId={exercise.exercise_id}
                                        initialCompleted={completedExercises.includes(exercise.exercise_id)}
                                    />

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-lg font-headline flex items-center gap-2">
                                                {exercise.name}
                                            </h4>
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
                                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                                            <div>
                                                <p className="font-semibold">Séries</p>
                                                <p>{exercise.sets || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Repetições</p>
                                                <p>{exercise.reps || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Carga</p>
                                                <p>{exercise.load ? `${exercise.load} kg` : '-'}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Descanso</p>
                                                <p>{exercise.rest ? `${exercise.rest} s` : '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
