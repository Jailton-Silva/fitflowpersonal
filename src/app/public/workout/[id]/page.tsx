
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, User, Calendar, Utensils, Video } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Workout } from "@/lib/definitions";

// Usar a chave de serviço para buscar dados, contornando o RLS para esta página pública específica.
// ATENÇÃO: Use isso com cuidado e apenas em rotas de servidor onde você controla o acesso.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function getWorkoutForPublic(workoutId: string) {
    const { data, error } = await supabaseAdmin
        .from('workouts')
        .select('*, students(id, name, avatar_url)')
        .eq('id', workoutId)
        .single();

    if (error || !data) {
        return null;
    }
    return data as Workout;
}


export default async function PublicWorkoutPage({ params }: { params: { id: string } }) {
    const workout = await getWorkoutForPublic(params.id);

    if (!workout) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="bg-background border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Dumbbell className="h-6 w-6 text-primary" />
                    <span className="font-headline font-semibold">FitFlow</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Plano de Treino de <span className="font-bold text-foreground">{workout.students?.name}</span>
                </div>
            </header>
            <main className="p-4 md:p-8 max-w-4xl mx-auto">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-headline">{workout.name}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
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
                            {(workout.exercises as any[]).map((exercise, index) => (
                                <Card key={index} className="bg-muted/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-headline flex items-center justify-between gap-2">
                                            {exercise.name}
                                            {exercise.video_url && (
                                                <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                                                   <Video className="h-4 w-4"/> Ver vídeo
                                                </a>
                                            )}
                                        </CardTitle>
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
        </div>
    );
}
