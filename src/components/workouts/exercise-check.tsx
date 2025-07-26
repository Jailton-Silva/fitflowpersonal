
"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { updateCompletedExercises } from "@/app/public/workout/[id]/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type ExerciseCheckProps = {
    sessionId: string;
    exerciseId: string;
    isCompleted: boolean;
};

export function ExerciseCheck({ sessionId, exerciseId, isCompleted }: ExerciseCheckProps) {
    const [checked, setChecked] = useState(isCompleted);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleChange = async (newCheckedState: boolean) => {
        setChecked(newCheckedState);
        startTransition(async () => {
            const { error } = await updateCompletedExercises(sessionId, exerciseId, newCheckedState);
            if (error) {
                setChecked(!newCheckedState); // Revert on error
                toast({
                    title: "Erro ao salvar progresso",
                    description: "Não foi possível atualizar o exercício. Tente novamente.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
         <div className="relative flex items-center justify-center h-5 w-5">
            {isPending && (
                <div className="absolute flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
            )}
            <Checkbox
                id={`exercise-${exerciseId}`}
                checked={checked}
                onCheckedChange={handleChange}
                disabled={isPending}
                className="h-5 w-5"
            />
        </div>
    );
}
