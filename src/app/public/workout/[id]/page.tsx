
'use server';

import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Workout } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

async function getWorkoutForPublic(workoutId: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error("Supabase URL or Anon Key is not defined.");
        return null;
    }
    // Use the standard client for server-side fetches on public pages
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name)')
        .eq('id', workoutId)
        .single();

    if (error) {
        console.error('Error fetching workout:', error);
        return null;
    }
    return data as Workout;
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

export default async function PublicWorkoutPage({ params, searchParams }: { params: { id: string }, searchParams: { token?: string } }) {
    
    const workout = await getWorkoutForPublic(params.id);

    if (!workout) {
        notFound();
    }

    const hasPassword = !!workout.access_password;
    const passwordVerified = searchParams.token === Buffer.from(workout.access_password!).toString('base64');
    
    async function verifyPassword(formData: FormData) {
        'use server'
        const password = formData.get('password') as string;
        if (password === workout?.access_password) {
            const token = Buffer.from(password).toString('base64');
            redirect(`/public/workout/${params.id}?token=${token}`);
        } else {
             redirect(`/public/workout/${params.id}?error=Senha incorreta`);
        }
    }

    if (hasPassword && !passwordVerified) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-center font-headline flex items-center justify-center gap-2">
                            <Lock className="h-5 w-5" />
                            Acesso Restrito
                        </CardTitle>
                        <CardDescription className="text-center pt-2">
                           Este plano de treino é protegido por senha. Por favor, insira a senha fornecida pelo seu treinador.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={verifyPassword} className="space-y-4">
                            <Input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                            />
                            {searchParams.error && <p className="text-sm text-destructive">{searchParams.error}</p>}
                            <Button type="submit" className="w-full ripple">Acessar Treino</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="bg-background min-h-screen">
             <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline text-primary">{workout.name}</CardTitle>
                                <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{workout.students?.name ?? 'Aluno'}</span>
                                    </span>
                                    <span className="flex items-center gap-2 mt-1 sm:mt-0">
                                        <Calendar className="h-4 w-4" />
                                        Criado em {format(new Date(workout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         {workout.description && (
                            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                               <p>{workout.description}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <h3 className="text-xl font-headline flex items-center gap-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
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
            </main>
            <footer className="text-center py-6">
                 <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} FitFlow. Treino fornecido por seu personal trainer.</p>
            </footer>
        </div>
    );
}
