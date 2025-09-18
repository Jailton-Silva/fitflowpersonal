
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authenticateStudent } from "./actions";

const LoginFormSchema = z.object({
  password: z.string().min(1, "A senha é obrigatória."),
});

type FormData = z.infer<typeof LoginFormSchema>;

export default function StudentLoginForm({ student }: { student: Pick<Student, 'id' | 'name' | 'email'> }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: { password: "" },
    });

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);

        const formData = new FormData();
        formData.append('studentId', student.id);
        formData.append('password', values.password);
        
        const result = await authenticateStudent(formData);

        if (result?.error) {
            toast({ title: "Erro de Autenticação", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Sucesso!", description: "Você foi autenticado com sucesso." });
            // Recarrega a página para refletir o estado de autenticado.
            window.location.reload(); 
        }

        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <div className="p-8 bg-card rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold font-headline">Portal do Aluno</h1>
                    <p className="text-muted-foreground">Bem-vindo(a), <span className="font-semibold text-foreground">{student.name}</span>. Faça login para continuar.</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sua Senha de Acesso</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Digite a senha fornecida pelo seu personal" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                           Entrar
                        </Button>
                    </form>
                </Form>
            </div>
             <footer className="text-center text-sm text-muted-foreground mt-8">
                <p>Acesse com o e-mail: <span className="font-semibold">{student.email}</span></p>
                <p>Esta é uma página de acesso exclusiva para você.</p>
            </footer>
        </div>
    );
}
