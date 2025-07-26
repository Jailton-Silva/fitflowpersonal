import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Utensils, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutExercise, Exercise, Student, Workout } from "@/lib/definitions";
import { ExerciseCheck } from "@/components/workouts/exercise-check";
import { getWorkoutSession, startWorkoutSession } from "./actions";


async function getWorkoutDetails(workoutId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select(
            'id, name, description, diet_plan, access_password, exercises, created_at, students(id, name, avatar_url)'
        )
        .eq('id', workoutId)
        .single();
    
    if (error || !data) {
        return { workout: null, exercises: [] };
    }

    const exerciseIds = (data.exercises as any[]).map(e => e.exercise_id);
    const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, video_url')
        .in('id', exerciseIds);
    
    if (exercisesError) {
        console.error("Error fetching exercise videos:", exercisesError);
        return { workout: data as Workout, exercises: [] };
    }

    return { workout: data as Workout, exercises: exercises as Pick<Exercise, 'id' | 'video_url'>[] };
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
    const { id } = params;

    const session = await getWorkoutSession(id);
    const { workout, exercises: exerciseDetails } = await getWorkoutDetails(id);
    
    if (!workout) {
        notFound();
    }
    
    if (workout.access_password && !session?.isPasswordVerified) {
        return <WorkoutPasswordForm workoutId={id} />;
    }

    const finalSession = session || await startWorkoutSession(id, workout.student_id!);

    const workoutExercisesWithVideos = (workout.exercises as WorkoutExercise[]).map(we => {
        const details = exerciseDetails.find(ed => ed.id === we.exercise_id);
        return {
            ...we,
            video_url: details?.video_url
        }
    });

    const student = workout.students as Student;

    return (
        <div className="flex flex-col min-h-screen bg-background">
             <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Dumbbell className="h-6 w-6 text-primary" />
                <h1 className="ml-2 text-2xl font-headline font-bold text-primary">FitFlow</h1>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                 <CardDescription className="flex items-center gap-4 mt-2">
                                     <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6 border">
                                            <AvatarImage src={student?.avatar_url || undefined} alt={student?.name} />
                                            <AvatarFallback className="text-xs">
                                                {student?.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>Aluno: {student?.name}</span>
                                    </div>
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
                            <div className="mb-6">
                                <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Utensils className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                <p>{workout.diet_plan}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                            {workoutExercisesWithVideos.map((exercise, index) => (
                                <Card key={index} className="bg-muted/50 flex items-center p-4">
                                    <ExerciseCheck sessionId={finalSession.id} exerciseId={exercise.exercise_id} isCompleted={finalSession.completed_exercises.includes(exercise.exercise_id)} />
                                    <div className="flex-1 ml-4">
                                        <div className="flex justify-between items-center">
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
                                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                                            <div><p className="font-semibold">Séries</p><p>{exercise.sets || '-'}</p></div>
                                            <div><p className="font-semibold">Repetições</p><p>{exercise.reps || '-'}</p></div>
                                            <div><p className="font-semibold">Carga</p><p>{exercise.load ? `${exercise.load} kg` : '-'}</p></div>
                                            <div><p className="font-semibold">Descanso</p><p>{exercise.rest ? `${exercise.rest} s` : '-'}</p></div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
             <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} FitFlow. Powered by you.</p>
            </footer>
        </div>
    );
}