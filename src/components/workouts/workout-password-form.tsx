
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useActionState } from "react";
import { portalLogin } from "@/app/portal/actions";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full ripple" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Acessar Portal
        </Button>
    )
}

export function WorkoutPasswordForm({ email }: { email: string }) {
    const { toast } = useToast();
    const router = useRouter();

    const loginAction = async (prevState: any, formData: FormData) => {
        const password = formData.get('password') as string;
        const response = await portalLogin(email, password);
        if (response.success && response.studentId) {
            router.push(`/portal/${response.studentId}`);
        }
        return { error: response.error };
    }
    
    const [state, formAction] = useActionState(loginAction, { error: null });

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
                            Este portal é protegido. Por favor, insira sua senha de acesso.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            className="hidden"
                            readOnly
                            value={email}
                        />
                         <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                        <SubmitButton />
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
