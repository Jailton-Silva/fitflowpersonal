import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

async function getWorkoutForPublic(workoutId: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
        .from('workouts')
        .select(`
            *,
            students (
                name
            )
        `)
        .eq('id', workoutId)
        .single();
    
    if (error) {
        console.error("Error fetching workout:", error);
        return null;
    }

    return data;
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


async function verifyPassword(formData: FormData) {
    'use server'
    const password = formData.get('password') as string;
    const workoutId = formData.get('workoutId') as string;

    if (!password || !workoutId) {
        return { error: 'ID do treino e senha são obrigatórios' };
    }
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
    
    const { data, error } = await supabase
        .from('workouts')
        .select('access_password')
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        return { error: 'Treino não encontrado' };
    }
    if (data.access_password !== password) {
        return { error: 'Senha incorreta' };
    }

    // Instead of setting cookies, we pass a search param to indicate success
    const { headers } = await import('next/headers');
    const url = new URL(headers().get('referer')!);
    url.searchParams.set('verified', 'true');
    const { redirect } = await import('next/navigation');
    redirect(url.toString());
}

const WorkoutView = ({ workout }: { workout: any }) => {
    return (
        <>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-x-4 gap-y-1 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <strong>Aluno:</strong> {workout.students?.name ?? 'Não identificado'}
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
                            <div className="prose prose-sm max-w-none text-muted-foreground mb-6 whitespace-pre-wrap">
                               <h3 className="font-headline text-lg mb-2">Plano de Dieta</h3>
                               <p>{workout.diet_plan}</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                            {(workout.exercises as any[]).map((exercise, index) => (
                                <Card key={index} className="bg-muted/50">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                                {exercise.name}
                                            </CardTitle>
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
            <footer className="py-6 w-full text-center border-t">
                <p className="text-xs text-muted-foreground">&copy; 2024 FitFlow. Powered by modern technology.</p>
            </footer>
        </>
    );
};

const PasswordForm = ({ workoutId, error }: { workoutId: string, error?: string }) => {
    return (
        <main className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <Lock className="h-6 w-6 text-primary" />
                        Acesso Protegido
                    </CardTitle>
                    <CardDescription>
                        Este treino é privado. Por favor, insira a senha para visualizar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={verifyPassword} className="space-y-4">
                        <input type="hidden" name="workoutId" value={workoutId} />
                        <div className="space-y-2">
                            <label htmlFor="password">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full ripple">Acessar Treino</Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
};

export default async function PublicWorkoutPage({
    params,
    searchParams
}: {
    params: { id: string };
    searchParams: { verified?: string, error?: string };
}) {
    const workoutId = params.id;
    const isVerified = searchParams.verified === 'true';

    const workout = await getWorkoutForPublic(workoutId);
    if (!workout) {
        notFound();
    }
    
    // Scenario 1: No password required, just show the workout
    if (!workout.access_password) {
        return <WorkoutView workout={workout} />;
    }

    // Scenario 2: Password required and it has been verified
    if (workout.access_password && isVerified) {
        return <WorkoutView workout={workout} />;
    }

    // Scenario 3: Password required, show the password form
    return <PasswordForm workoutId={workoutId} error={searchParams.error} />;
}