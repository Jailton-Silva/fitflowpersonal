

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Utensils, LockKeyhole } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Workout, WorkoutExercise } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Use Supabase client with service role key for server-side data fetching on public pages
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);


async function getWorkoutDetails(workoutId: string): Promise<Workout | null> {
    const { data, error } = await supabase
        .from('workouts')
        .select('*, students(id, name)')
        .eq('id', workoutId)
        .single();
    
    if (error || !data) {
        console.error("Error fetching workout (public):", error);
        return null;
    }
    return data as Workout;
}

async function verifyPassword(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    const workoutId = formData.get("workoutId") as string;

    const { data, error } = await supabase
        .from("workouts")
        .select("access_password")
        .eq("id", workoutId)
        .single();
    
    if (error || !data) {
        return { success: false, message: "Treino não encontrado." };
    }
    
    if (data.access_password === password) {
        return { success: true };
    } else {
        return { success: false, message: "Senha incorreta." };
    }
}

const WorkoutView = ({ workout }: { workout: Workout }) => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                        <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{workout.students?.name}</span>
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
                {(workout.exercises as WorkoutExercise[]).map((exercise, index) => (
                        <Card key={index} className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-headline flex items-center gap-2">
                                {exercise.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><p className="font-semibold">Séries</p><p>{exercise.sets || '-'}</p></div>
                                <div><p className="font-semibold">Repetições</p><p>{exercise.reps || '-'}</p></div>
                                <div><p className="font-semibold">Carga</p><p>{exercise.load ? `${exercise.load} kg` : '-'}</p></div>
                                <div><p className="font-semibold">Descanso</p><p>{exercise.rest ? `${exercise.rest} s` : '-'}</p></div>
                            </div>
                            {exercise.video_url && (
                                <div className="mt-4">
                                    <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                        Ver vídeo de execução
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </CardContent>
    </Card>
);

const PasswordForm = ({ workoutId, message }: { workoutId: string, message?: string }) => (
     <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                 <div className="flex justify-center mb-4">
                    <LockKeyhole className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-center font-headline">Acesso Restrito</CardTitle>
                <CardDescription className="text-center">
                    Este plano de treino é protegido por senha. Por favor, insira a senha para visualizar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {message && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
                 <form action={verifyPassword} className="space-y-4">
                    <Input name="password" type="password" placeholder="Senha de Acesso" required />
                    <Input type="hidden" name="workoutId" value={workoutId} />
                    <Button type="submit" className="w-full ripple">Acessar Treino</Button>
                </form>
            </CardContent>
        </Card>
    </div>
)


export default async function PublicWorkoutPage({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, error?: string } }) {
    const workout = await getWorkoutDetails(params.id);

    if (!workout) {
        notFound();
    }

    // Se não há senha, exibe o treino
    if (!workout.access_password) {
        return <div className="p-4 sm:p-8"><WorkoutView workout={workout} /></div>;
    }

    // Se há senha e a senha da URL é correta
    if (searchParams.p === workout.access_password) {
         return <div className="p-4 sm:p-8"><WorkoutView workout={workout} /></div>;
    }
    
    // Se há senha, mas a tentativa de submissão do formulário falhou
    if(searchParams.error) {
         return <PasswordForm workoutId={params.id} message={searchParams.error} />;
    }
    
    // Se a senha não foi fornecida na URL ou está incorreta, mostra o formulário de senha
    // Esta é a renderização inicial para um treino com senha
    if (workout.access_password) {
        // Lógica para lidar com o POST do formulário de senha
        // Esta lógica agora está em `verifyPassword` e a página será recarregada com os parâmetros corretos
        return <PasswordForm workoutId={params.id} />;
    }

    // Como fallback, se algo der errado, mostra o formulário.
    return <PasswordForm workoutId={params.id} />;
}
