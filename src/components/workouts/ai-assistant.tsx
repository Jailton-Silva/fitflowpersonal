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
                title: "Please select a student first",
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
                throw new Error("Could not fetch student data");
            }
            
            const studentProfile = `Goals: ${student.goals}. Medical Conditions: ${student.medical_conditions}`;
            const workoutHistory = workouts.map(w => `${w.name}: ${w.exercises.map(e => e.name).join(', ')}`).join('; ');

            const result = await getExerciseRecommendations({
                studentProfile: studentProfile || "No profile provided.",
                workoutHistory: workoutHistory || "No history provided.",
                trainerPreferences: trainerPrefs || "No preferences provided.",
            });
            onAddExercises(result);
        } catch (error) {
            console.error(error);
            toast({
                title: "AI Assistant Error",
                description: "Could not generate recommendations. Please try again.",
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
                    AI Assistant
                </CardTitle>
                <CardDescription>
                    Get smart exercise recommendations based on student data.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="Trainer Preferences (e.g., focus on compound lifts, avoid high-impact exercises)"
                    value={trainerPrefs}
                    onChange={(e) => setTrainerPrefs(e.target.value)}
                />
                <Button className="w-full ripple" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Recommendations
                </Button>
            </CardContent>
        </Card>
    )
}
