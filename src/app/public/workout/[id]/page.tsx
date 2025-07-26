import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Utensils, Lock, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workout } from "@/lib/definitions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";

async function getWorkoutDetails(workoutId: string): Promise<Workout | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name)')
        .eq('id', workoutId)
        .single();

    if (error) {
        console.error("Error fetching public workout:", error);
        return null;
    }
    return data as Workout;
}

async function verifyPassword(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;
    const workoutId = formData.get('workoutId') as string;
    const supabase = createClient();

    const { data, error } = await supabase
        .from('workouts')
        .select('access_password')
        .eq('id', workoutId)
        .single();
    
    if (error || !data) {
        return redirect(`/public/workout/${workoutId}?error=Workout not found`);
    }

    if (data.access_password === password) {
        // Redirect with a success flag
        return redirect(`/public/workout/${workoutId}?verified=true`);
    } else {
        return redirect(`/public/workout/${workoutId}?error=Invalid password`);
    }
}


function PasswordForm({ workoutId, error }: { workoutId: string, error?: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center font-headline">Acesso Restrito</CardTitle>
                    <CardDescription className="text-center">
                        Este treino é protegido por senha. Por favor, insira a senha fornecida pelo seu treinador.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 text-center text-sm text-destructive-foreground bg-destructive/80 rounded-md">
                            {error}
                        </div>
                    )}
                    <form action={verifyPassword} className="space-y-4">
                        <input type="hidden" name="workoutId" value={workoutId} />
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha do Treino</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <SubmitButton className="w-full ripple">
                            Acessar Treino
                        </SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function WorkoutView({ workout }: { workout: Workout }) {
    return (
         <div className="min-h-screen bg-muted">
            <header className="bg-card shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-semibold font-headline">
                      <Dumbbell className="h-6 w-6 text-primary" />
                      <span className="">FitFlow</span>
                    </div>
                     <Button variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar ao site
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{workout.students?.name ?? 'Aluno'}</span>
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
                            <div className="mb-6">
                                <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Utensils className="h-5 w-5 text-primary" />Plano de Dieta</h3>
                                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                <p>{workout.diet_plan}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-headline flex items-center gap-2 mb-2"><Dumbbell className="h-5 w-5 text-primary" />Exercícios</h3>
                            {(workout.exercises as any[]).map((exercise, index) => (
                                <Card key={index} className="bg-muted/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-headline flex items-center gap-2">
                                            {exercise.name}
                                             {exercise.video_url && (
                                                <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-normal">
                                                    (Ver vídeo)
                                                </a>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div><p className="font-semibold">Séries</p><p>{exercise.sets || '-'}</p></div>
                                            <div><p className="font-semibold">Repetições</p><p>{exercise.reps || '-'}</p></div>
                                            <div><p className="font-semibold">Carga</p><p>{exercise.load ? `${exercise.load} kg` : '-'}</p></div>
                                            <div><p className="font-semibold">Descanso</p><p>{exercise.rest ? `${exercise.rest} s` : '-'}</p></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default async function PublicWorkoutPage({ 
    params,
    searchParams
}: { 
    params: { id: string };
    searchParams: { error?: string, verified?: string } 
}) {
    const workoutId = params.id;
    const workout = await getWorkoutDetails(workoutId);

    if (!workout) {
        notFound();
    }
    
    // If no password is set, show the workout immediately
    if (!workout.access_password) {
        return <WorkoutView workout={workout} />;
    }

    // If password is set, check if it has been verified
    if (searchParams.verified === 'true') {
        return <WorkoutView workout={workout} />;
    }

    // Otherwise, show the password form
    return <PasswordForm workoutId={workoutId} error={searchParams.error} />;
}