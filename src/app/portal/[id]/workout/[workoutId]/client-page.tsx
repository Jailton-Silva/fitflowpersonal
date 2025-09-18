
"use client";

import { useState, useEffect } from "react";
import { Student, Workout } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Lock, Video, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface WorkoutClientPageProps {
    student: Pick<Student, 'id' | 'name' | 'avatar_url' | 'access_password'>;
    workout: Workout;
}

export default function WorkoutClientPage({ student, workout }: WorkoutClientPageProps) {
    const { toast } = useToast();
    const [portalAuthenticated, setPortalAuthenticated] = useState(false);
    const [portalPassword, setPortalPassword] = useState("");

    const [workoutAuthenticated, setWorkoutAuthenticated] = useState(false);
    const [workoutPassword, setWorkoutPassword] = useState("");

    // Efeito para verificar as autenticações necessárias ao carregar
    useEffect(() => {
        if (!student.access_password) {
            setPortalAuthenticated(true);
            // Se o portal não tem senha, verifica a do treino
            if (!workout.access_password) {
                setWorkoutAuthenticated(true);
            }
        } else {
             document.getElementById("portal-password-input")?.focus();
        }
    }, [student.access_password, workout.access_password]);

    const handlePortalPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/verify-student-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: student.id, password: portalPassword })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setPortalAuthenticated(true);
                toast({ title: "Acesso ao portal liberado!" });
                // Após liberar o portal, verifica o treino
                if (!workout.access_password) {
                    setWorkoutAuthenticated(true);
                } else {
                    document.getElementById("workout-password-input")?.focus();
                }
            } else {
                throw new Error(result.error || "Senha do portal incorreta.");
            }
        } catch (error: any) {
            toast({ title: "Erro de Autenticação", description: error.message, variant: "destructive" });
        }
    };

    const handleWorkoutPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (workout.access_password === workoutPassword) {
            setWorkoutAuthenticated(true);
            toast({ title: "Acesso ao treino liberado!", description: "Bom treino!" });
        } else {
            toast({ title: "Senha do treino incorreta", variant: "destructive" });
        }
    };

    const renderContent = () => {
        // 1. Precisa de senha do portal?
        if (!portalAuthenticated) {
            return (
                <form onSubmit={handlePortalPasswordSubmit} className="max-w-sm mx-auto flex flex-col gap-4 py-8 text-center">
                    <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="font-semibold">Acesso ao Portal Requerido</h3>
                    <p className="text-muted-foreground text-sm">Primeiro, digite a senha de acesso principal do seu portal.</p>
                    <Input
                        id="portal-password-input"
                        type="password"
                        value={portalPassword}
                        onChange={(e) => setPortalPassword(e.target.value)}
                        placeholder="Senha de acesso do portal"
                        required
                    />
                    <Button type="submit">Liberar Acesso</Button>
                </form>
            );
        }

        // 2. Precisa de senha do treino?
        if (!workoutAuthenticated) {
            return (
                <form onSubmit={handleWorkoutPasswordSubmit} className="max-w-sm mx-auto flex flex-col gap-4 py-8 text-center">
                    <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="font-semibold">Treino Protegido</h3>
                    <p className="text-muted-foreground text-sm">Agora, digite a senha específica para este treino.</p>
                    <Input
                        id="workout-password-input"
                        type="password"
                        value={workoutPassword}
                        onChange={(e) => setWorkoutPassword(e.target.value)}
                        placeholder="Senha de acesso do treino"
                        required
                    />
                    <Button type="submit">Acessar Treino</Button>
                </form>
            );
        }

        // 3. Conteúdo do treino liberado
        return (
            <div className="space-y-4">
                {(workout.exercises as any[]).map((exercise: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-lg flex-1 pr-2">{exercise.name}</h4>
                            {exercise.video_url && (
                                <Button asChild variant="outline" size="sm">
                                    <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1"><Video className="h-4 w-4"/> Ver vídeo</a>
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            <div><strong>Séries:</strong> {exercise.sets || '-'}</div>
                            <div><strong>Reps:</strong> {exercise.reps || '-'}</div>
                            <div><strong>Carga:</strong> {exercise.load || '-'}</div>
                            <div><strong>Descanso:</strong> {exercise.rest ? `${exercise.rest}s` : '-'}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-2xl">{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold font-headline">Portal de {student.name}</h1>
                    <Link href={`/portal/${student.id}`} className="text-sm text-muted-foreground hover:underline">
                        &larr; Voltar para a lista de treinos
                    </Link>
                </div>
            </header>

            <main>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Dumbbell /> {workout.name}</CardTitle>
                        {workout.description && <p className="text-muted-foreground pt-2 text-sm font-normal">{workout.description}</p>}
                    </CardHeader>
                    <CardContent>{renderContent()}</CardContent>
                </Card>
            </main>

             <footer className="text-center text-xs text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} FitFlow. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
