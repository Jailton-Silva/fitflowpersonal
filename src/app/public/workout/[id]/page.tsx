
import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Lock, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Workout } from "@/lib/definitions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Função para buscar os dados do treino de forma pública
async function getWorkoutForPublic(id: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Consulta para buscar o treino e o nome do aluno associado
    const { data, error } = await supabase
        .from('workouts')
        .select(`
            *,
            students ( name )
        `)
        .eq('id', id)
        .single();
    
    if (error) {
        console.error("Error fetching workout:", error.message);
        return null;
    }

    return data;
}

// Ação do servidor para verificar a senha
async function verifyPassword(formData: FormData) {
    'use server'
    const password = formData.get('password') as string;
    const workoutId = formData.get('workoutId') as string;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase
        .from('workouts')
        .select('access_password')
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        return redirect(`/public/workout/${workoutId}?error=Workout not found`);
    }

    if (data.access_password === password) {
        // Redireciona com um token de sucesso para evitar expor a senha na URL
        return redirect(`/public/workout/${workoutId}?verified=true`);
    } else {
        return redirect(`/public/workout/${workoutId}?error=Invalid password`);
    }
}

// Componente para exibir o player de vídeo
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

// Componente da Página
export default async function PublicWorkoutPage({ params, searchParams }: { params: { id: string }; searchParams: { verified?: string, error?: string } }) {
    const workoutId = params.id;
    const isVerified = searchParams.verified === 'true';

    const workout = await getWorkoutForPublic(workoutId);

    if (!workout) {
        notFound();
    }
    
    // Se o treino tem senha e não foi verificada, mostra o formulário de senha
    if (workout.access_password && !isVerified) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Acesso Restrito</CardTitle>
                        <CardDescription>
                           Este treino é protegido por senha. Por favor, insira a senha fornecida pelo seu treinador.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={verifyPassword} className="space-y-4">
                            <Input name="password" type="password" placeholder="Senha de acesso" required />
                            <Input name="workoutId" type="hidden" value={workoutId} />
                             {searchParams.error && <p className="text-sm text-red-500">{searchParams.error}</p>}
                            <Button type="submit" className="w-full">Acessar Treino</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const studentName = (workout.students as any)?.name ?? "Aluno";

    // Se a senha estiver correta (ou não houver senha), mostra o treino
    return (
       <div className="bg-background min-h-screen">
         <header className="p-4 bg-card shadow-sm">
            <div className="container mx-auto">
                <div className="flex items-center gap-2 font-semibold font-headline text-primary">
                    <Dumbbell className="h-6 w-6" />
                    <span className="">FitFlow</span>
                </div>
            </div>
        </header>
         <main className="container mx-auto p-4 md:p-8">
            <Card className="max-w-4xl mx-auto">
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-2">
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{studentName}</span>
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
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><User className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                             <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                               <p>{workout.diet_plan}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios do Plano</h3>
                        {(workout.exercises as any[]).map((exercise, index) => (
                             <Card key={index} className="bg-muted/50 overflow-hidden">
                                <CardHeader className="pb-4">
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
        <footer className="py-6 mt-8 w-full text-center border-t">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} FitFlow. Seu plano de treino pessoal.</p>
        </footer>
       </div>
    );
}
