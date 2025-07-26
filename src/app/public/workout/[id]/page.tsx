
"use client";

import { createClient } from "@/lib/supabase/client";
import { notFound, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Workout, WorkoutExercise } from "@/lib/definitions";
import { useEffect, useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";


type CombinedExercise = WorkoutExercise & {
    instructions?: string;
    description?: string;
}

type PublicWorkout = Omit<Workout, 'exercises'> & {
    exercises: CombinedExercise[];
    studentName: string;
};

// This function now runs on the client
async function getWorkoutForPublic(workoutId: string): Promise<PublicWorkout | null> {
    const supabase = createClient();
    const { data: workout, error } = await supabase
        .from('workouts')
        .select('*, students(name)')
        .eq('id', workoutId)
        .single();
    
    if (error || !workout) {
        console.error("[ Server ] Error fetching workout:", error);
        return null;
    }

    if (!workout.students) {
         console.error("[ Server ] Error: Student not found for workout");
         return null;
    }

    const exerciseIds = workout.exercises.map(e => e.exercise_id);
    const { data: exercisesDetails, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds);

    if (exercisesError) {
        console.error("[ Server ] Error fetching exercise details:", exercisesError);
        return null;
    }
    
    const combinedExercises = workout.exercises.map(workoutEx => {
        const details = exercisesDetails.find(d => d.id === workoutEx.exercise_id);
        return {
            ...workoutEx,
            ...details,
        };
    });

    return {
        ...workout,
        exercises: combinedExercises,
        studentName: workout.students.name,
    };
}


const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
        return <p className="text-center text-muted-foreground p-4">URL do vídeo inválida ou não é do YouTube.</p>
    }
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (!videoId) {
         return <p className="text-center text-muted-foreground p-4">Não foi possível extrair o ID do vídeo.</p>
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
        <iframe
            width="100%"
            height="400"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    );
};

const ExerciseCheck = ({ workoutId, studentId, exerciseId, isInitiallyChecked, onCheckedChange }: { workoutId: string, studentId: string, exerciseId: string, isInitiallyChecked: boolean, onCheckedChange: (exerciseId: string, isChecked: boolean) => void }) => {
    const [isChecked, setIsChecked] = useState(isInitiallyChecked);
    const [isPending, startTransition] = useTransition();

    const handleCheckedChange = async (checked: boolean) => {
        setIsChecked(checked);
        startTransition(async () => {
           onCheckedChange(exerciseId, checked);
        });
    };

    return (
         <Checkbox
            id={`check-${exerciseId}`}
            checked={isChecked}
            onCheckedChange={handleCheckedChange}
            disabled={isPending}
            className="w-5 h-5"
        />
    )
}

export default function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const workoutId = params.id;
    const hasAccess = searchParams.get('access') === 'granted';

    const [workout, setWorkout] = useState<PublicWorkout | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsPassword, setNeedsPassword] = useState(false);
    const [completedExercises, setCompletedExercises] = useState<string[]>([]);
    
    useEffect(() => {
        const fetchWorkout = async () => {
            setLoading(true);
            const data = await getWorkoutForPublic(workoutId);
            setWorkout(data);

            if (data?.access_password && !hasAccess) {
                setNeedsPassword(true);
            } else if (data) {
                const supabase = createClient();
                const { data: sessionData, error } = await supabase
                    .from('workout_sessions')
                    .select('completed_exercises')
                    .eq('workout_id', workoutId)
                    .eq('student_id', data.student_id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (sessionData) {
                    setCompletedExercises(sessionData.completed_exercises || []);
                }
            }
            setLoading(false);
        };

        fetchWorkout();
    }, [workoutId, hasAccess]);
    
    const handleCheckChange = async (exerciseId: string, isChecked: boolean) => {
        if (!workout) return;

        const supabase = createClient();
        
        // Optimistically update UI
        const newCompleted = isChecked 
            ? [...completedExercises, exerciseId]
            : completedExercises.filter(id => id !== exerciseId);
        setCompletedExercises(newCompleted);

        try {
             const { data: session, error: sessionError } = await supabase
                .from('workout_sessions')
                .select('id, completed_exercises')
                .eq('workout_id', workoutId)
                .eq('student_id', workout.student_id)
                .order('created_at', { ascending: false })
                .limit(1).single();

            let currentSessionId = session?.id;

            // Create a new session if none exists
            if (!session) {
                const { data: newSession, error: newSessionError } = await supabase
                    .from('workout_sessions')
                    .insert({
                        workout_id: workoutId,
                        student_id: workout.student_id,
                        completed_exercises: [exerciseId]
                    })
                    .select('id')
                    .single();

                if (newSessionError) throw newSessionError;
                currentSessionId = newSession.id;

            } else {
                 const { error: updateError } = await supabase
                    .from('workout_sessions')
                    .update({ completed_exercises: newCompleted })
                    .eq('id', currentSessionId);
                
                if (updateError) throw updateError;
            }
        } catch (error: any) {
            console.error("Error saving progress:", error);
            // Revert optimistic update on error
            setCompletedExercises(completedExercises);
            toast({
                title: "Erro ao salvar progresso",
                description: "Não foi possível salvar sua marcação. Tente novamente.",
                variant: "destructive"
            })
        }
    }


    if (loading) {
        return (
             <div className="space-y-6 container py-12">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <div className="flex items-center gap-4 mt-2">
                           <Skeleton className="h-5 w-48" />
                           <Skeleton className="h-5 w-64" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <Skeleton className="h-20 w-full" />
                       <Skeleton className="h-12 w-1/4" />
                       <div className="space-y-4">
                           <Skeleton className="h-24 w-full" />
                           <Skeleton className="h-24 w-full" />
                       </div>
                    </CardContent>
                </Card>
             </div>
        )
    }

    if (needsPassword) {
        return <WorkoutPasswordForm workoutId={workoutId} />
    }
    
    if (!workout) {
        notFound();
    }


    return (
        <main className="bg-muted min-h-screen py-8 sm:py-12">
            <div className="container mx-auto" id="printable-area">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Aluno: {workout.studentName}</span>
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
                            <div className="mb-6">
                                <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                <p>{workout.diet_plan}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                             {(workout.exercises as CombinedExercise[]).map((exercise, index) => (
                                <Card key={index} className="bg-background/50">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <ExerciseCheck 
                                                    workoutId={workout.id}
                                                    studentId={workout.student_id}
                                                    exerciseId={exercise.exercise_id!}
                                                    isInitiallyChecked={completedExercises.includes(exercise.exercise_id!)}
                                                    onCheckedChange={handleCheckChange}
                                                />
                                                <CardTitle className="text-lg font-headline flex items-center gap-2">
                                                    {exercise.name}
                                                </CardTitle>
                                            </div>
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
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ml-8">
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
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

