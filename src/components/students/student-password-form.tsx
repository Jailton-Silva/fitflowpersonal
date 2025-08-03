
"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { verifyStudentPassword } from "@/app/public/student/[id]/actions";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Loader2, User } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full ripple" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Acessar Portal
        </Button>
    )
}

export function StudentPasswordForm({ studentId }: { studentId: string }) {
    const { toast } = useToast();
    const router = useRouter();
    const [state, formAction] = useActionState(verifyStudentPassword, { error: null, success: false });

    useEffect(() => {
        if (state?.error) {
            toast({
                title: "Erro de Autenticação",
                description: state.error,
                variant: "destructive",
            });
        }
        if (state?.success) {
            router.refresh();
        }
    }, [state, toast, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <Card className="mx-auto max-w-sm w-full">
                <form action={formAction}>
                    <CardHeader className="text-center">
                        <User className="mx-auto h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-headline mt-4">Portal do Aluno</CardTitle>
                        <CardDescription>
                            Este portal é protegido por senha. Por favor, insira a senha fornecida pelo seu personal trainer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Hidden username field for accessibility */}
                        <Input 
                            type="text"
                            name="username"
                            autoComplete="username"
                            className="hidden"
                            defaultValue={`student-${studentId}`}
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                        <input type="hidden" name="studentId" value={studentId} />
                        <SubmitButton />
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
