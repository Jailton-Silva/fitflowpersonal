
"use client";

import { useState, useEffect } from "react";
import { Student, Workout } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Lock, Video, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface PortalClientPageProps {
    student: Pick<Student, 'id' | 'name' | 'avatar_url' | 'access_password'>;
    initialWorkouts: Workout[];
}

export default function PortalClientPage({ student, initialWorkouts }: PortalClientPageProps) {
    const { toast } = useToast();
    const [portalAuthenticated, setPortalAuthenticated] = useState(false);
    const [portalPassword, setPortalPassword] = useState("");
    
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [workoutPassword, setWorkoutPassword] = useState("");
    const [workoutAuthenticated, setWorkoutAuthenticated] = useState(false);

    useEffect(() => {
        if (!student.access_password) {
            setPortalAuthenticated(true);
        } else {
            document.getElementById("portal-password-input")?.focus();
        }
    }, [student.access_password]);

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
                toast({ title: "Acesso ao portal liberado!", description: "Bem-vindo(a)!" });
            } else {
                throw new Error(result.error || "Senha do portal incorreta.");
            }
        } catch (error: any) {
            toast({ title: "Erro de Autenticação", description: error.message, variant: "destructive" });
        }
    };

    const handleWorkoutSelect = (workout: Workout) => {
        setSelectedWorkout(workout);
        if (!workout.access_password) {
            setWorkoutAuthenticated(true);
        } else {
            setWorkoutAuthenticated(false);
            setWorkoutPassword("");
            setTimeout(() => document.getElementById("workout-password-input")?.focus(), 100);
        }
    };

    const handleWorkoutPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedWorkout && selectedWorkout.access_password === workoutPassword) {
            setWorkoutAuthenticated(true);
            toast({ title: "Acesso ao treino liberado!", description: "Bom treino!" });
        } else {
            toast({ title: "Senha do treino incorreta", variant: "destructive" });
        }
    };

    const handleBackToList = () => {
        setSelectedWorkout(null);
        setWorkoutAuthenticated(false);
        setWorkoutPassword("");
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={student.avatar_url || undefined} alt={student.name} />
                    <AvatarFallback className="text-2xl">{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold font-headline">Portal de {student.name}</h1>
                    <p className="text-muted-foreground">Bem-vindo(a) ao seu espaço de treino!</p>
                </div>
            </header>

            <main>
                {!portalAuthenticated ? (
                    <div className="max-w-md mx-auto text-center py-12">
                         <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-2xl font-bold">Portal Protegido</h2>
                        <p className="mt-2 text-muted-foreground">Por favor, insira sua senha de acesso para continuar.</p>
                        <form onSubmit={handlePortalPasswordSubmit} className="mt-6 flex flex-col gap-4">
                            <Input
                                id="portal-password-input"
                                type="password"
                                value={portalPassword}
                                onChange={(e) => setPortalPassword(e.target.value)}
                                placeholder="Senha de acesso do portal"
                                required
                            />
                            <Button type="submit">Desbloquear</Button>
                        </form>
                    </div>
                ) : !selectedWorkout ? (
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="text-green-500"/> Acesso Liberado</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <h3 className="font-semibold">Seus treinos disponíveis:</h3>
                            {initialWorkouts.length > 0 ? (
                                initialWorkouts.map((workout) => (
                                    <button key={workout.id} onClick={() => handleWorkoutSelect(workout)} className="w-full text-left p-4 rounded-lg transition-colors hover:bg-muted border flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{workout.name}</p>
                                            <p className="text-sm text-muted-foreground">{workout.description || `${(workout.exercises as any[]).length} exercícios`}</p>
                                        </div>
                                        {workout.access_password && <Lock className="h-5 w-5 text-muted-foreground" />}
                                    </button>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">Nenhum treino ativo foi encontrado para você no momento.</p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div>
                         <Button variant="outline" onClick={handleBackToList} className="mb-4">Voltar para a lista</Button>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell /> {selectedWorkout.name}</CardTitle></CardHeader>
                             <CardContent>
                                {selectedWorkout.description && <p className="text-muted-foreground mb-6">{selectedWorkout.description}</p>}
                                {!workoutAuthenticated ? (
                                     <form onSubmit={handleWorkoutPasswordSubmit} className="flex flex-col gap-4 max-w-sm mx-auto py-8 text-center">
                                        <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
                                        <h3 className="font-semibold">Treino Protegido</h3>
                                        <p className="text-muted-foreground text-sm">Este treino também é protegido por senha.</p>
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
                                ) : (
                                    <div className="space-y-4">
                                        {(selectedWorkout.exercises as any[]).map((exercise: any, index: number) => (
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
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
            <footer className="text-center text-xs text-muted-foreground"><p>&copy; {new Date().getFullYear()} FitFlow. Todos os direitos reservados.</p></footer>
        </div>
    );
}
