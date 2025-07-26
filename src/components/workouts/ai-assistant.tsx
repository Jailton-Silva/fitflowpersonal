"use client"

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { getExerciseRecommendations } from "@/ai/flows/exercise-recommendations";
import type { ExerciseRecommendationsOutput } from "@/ai/flows/exercise-recommendations";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

type AiAssistantProps = {
    studentId: string;
    onAddExercises: (recommendations: ExerciseRecommendationsOutput) => void;
};

export default function AiAssistant({ studentId, onAddExercises }: AiAssistantProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [trainerPrefs, setTrainerPrefs] = useState("");
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!studentId) {
            toast({
                title: "Por favor, selecione um aluno primeiro",
                variant: "destructive"
            });
            return;
        }
        setIsLoading(true);
        try {
            const supabase = createClient();
            const {data: student, error: studentError} = await supabase.from("students").select("goals, medical_conditions").eq("id", studentId).single();
            const {data: workouts, error: workoutError} = await supabase.from("workouts").select("name, exercises").eq("student_id", studentId);
            
            if(studentError || workoutError) {
                throw new Error("Não foi possível buscar os dados do aluno");
            }
            
            const studentProfile = `Objetivos: ${student.goals}. Condições Médicas: ${student.medical_conditions}`;
            const workoutHistory = workouts.map(w => `${w.name}: ${w.exercises.map(e => e.name).join(', ')}`).join('; ');

            const result = await getExerciseRecommendations({
                studentProfile: studentProfile || "Nenhum perfil fornecido.",
                workoutHistory: workoutHistory || "Nenhum histórico fornecido.",
                trainerPreferences: trainerPrefs || "Nenhuma preferência fornecida.",
            });
            onAddExercises(result);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro no Assistente de IA",
                description: "Não foi possível gerar recomendações. Por favor, tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="text-primary" />
                    Assistente IA
                </CardTitle>
                <CardDescription>
                    Obtenha recomendações de exercícios inteligentes com base nos dados do aluno.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="Preferências do treinador (ex: foco em levantamentos compostos, evitar exercícios de alto impacto)"
                    value={trainerPrefs}
                    onChange={(e) => setTrainerPrefs(e.target.value)}
                />
                <Button className="w-full ripple" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Gerar Recomendações
                </Button>
            </CardContent>
        </Card>
    )
}
