
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkoutPasswordForm } from "@/components/workouts/workout-password-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutExercise } from "@/lib/definitions";
import { ExerciseCheck } from "@/components/workouts/exercise-check";


// This function can be uncommented and configured if you need to create a server-side client
// with service_role key for admin-level access. For public pages, the anon key is sufficient.
// import { cookies } from "next/headers";
// const createSupabaseServerClient = () => {
//   const cookieStore = cookies();
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value;
//         },
//       },
//     }
//   );
// };

const getWorkoutForPublic = async (workoutId: string) => {
    // Use the standard client for public, anonymous access
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    try {
        const { data: workout, error } = await supabase
            .from('workouts')
            .select('*, students(id, name)')
            .eq('id', workoutId)
            .single();
        
        if (error) throw error;

        // Now, fetch all exercise details for this workout
        const exerciseIds = workout.exercises.map((e: WorkoutExercise) => e.exercise_id);
        const { data: exerciseDetails, error: exercisesError } = await supabase
            .from('exercises')
            .select('id, name, video_url')
            .in('id', exerciseIds);

        if (exercisesError) throw exercisesError;

        // Combine workout exercise data with full exercise details
        const combinedExercises = workout.exercises.map((we: WorkoutExercise) => {
            const details = exerciseDetails.find(ed => ed.id === we.exercise_id);
            return {
                ...we,
                ...details,
            };
        });

        return { ...workout, exercises: combinedExercises };

    } catch (error) {
        console.error('[ Server ] Error fetching workout:', error);
        return null;
    }
}


const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
        return <p>URL do vídeo inválida ou não é do YouTube.</p>
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
    const workoutId = params.id;
    const workout = await getWorkoutForPublic(workoutId);

    if (!workout) {
        notFound();
    }

    const isPasswordProtected = !!workout.access_password;
    const hasValidToken = searchParams.token === workout.access_password;

    if (isPasswordProtected && !hasValidToken) {
        return <WorkoutPasswordForm workoutId={workout.id} />;
    }

    return (
        <div className="bg-background min-h-screen">
            <main className="container mx-auto p-4 sm:p-6 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Aluno(a): {workout.students?.name ?? "Não especificado"}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                </CardDescription>
                            </div>
                            <Dumbbell className="h-8 w-8 text-primary hidden sm:block" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {workout.description && (
                            <div className="prose prose-sm max-w-none text-muted-foreground mb-6 whitespace-pre-wrap">
                               <p>{workout.description}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                            {(workout.exercises as any[]).map((exercise, index) => (
                                 <Card key={index} className="bg-muted/50">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <ExerciseCheck exerciseId={exercise.exercise_id || exercise.name} />
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
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
            </main>
             <footer className="text-center p-4 text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} FitFlow. Treino fornecido por seu personal trainer.</p>
            </footer>
        </div>
    );
}
