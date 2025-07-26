
"use client";

import { verifyPassword } from "@/app/public/workout/[id]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useEffect, useActionState } from "react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full ripple" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Acessar Treino
        </Button>
    )
}

export function WorkoutPasswordForm({ workoutId }: { workoutId: string }) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(verifyPassword, { error: null });

    useEffect(() => {
        if (state?.error) {
            toast({
                title: "Erro de Autenticação",
                description: state.error,
                variant: "destructive",
            });
        }
    }, [state, toast]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <Card className="mx-auto max-w-sm w-full">
                <form action={formAction}>
                    <CardHeader className="text-center">
                        <Lock className="mx-auto h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-headline mt-4">Acesso Restrito</CardTitle>
                        <CardDescription>
                            Este treino é protegido por senha. Por favor, insira a senha para visualizar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                        />
                        <input type="hidden" name="workoutId" value={workoutId} />
                        <SubmitButton />
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
