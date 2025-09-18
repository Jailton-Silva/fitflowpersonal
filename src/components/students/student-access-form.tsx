
"use client"

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateStudentAccessPassword } from "@/app/(app)/students/actions";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Loader2 } from "lucide-react";

const AccessPasswordSchema = z.object({
  studentId: z.string(),
  access_password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres.").or(z.literal('')),
});

type FormData = z.infer<typeof AccessPasswordSchema>;

export default function StudentAccessForm({ student }: { student: Student }) {
    const { toast } = useToast();
    
    const form = useForm<FormData>({
        resolver: zodResolver(AccessPasswordSchema),
        defaultValues: {
            studentId: student.id,
            access_password: student.access_password || "",
        }
    });
    
    const [state, formAction] = useActionState(updateStudentAccessPassword, null);

    useEffect(() => {
        if (state?.message) {
            if (state.errors) {
                 toast({ title: "Erro!", description: state.message, variant: "destructive" });
            } else {
                 toast({ title: "Sucesso!", description: state.message });
                 // A ação foi bem-sucedida, vamos resetar o formulário se necessário
                 form.reset({ ...form.getValues(), access_password: form.getValues('access_password') });
            }
        }
    }, [state, toast, form]);
    
    const generatePassword = () => {
        const newPassword = Math.random().toString(36).slice(-8);
        form.setValue('access_password', newPassword);
    }

    const copyPassword = () => {
        const password = form.getValues('access_password');
        if (password) {
            navigator.clipboard.writeText(password);
            toast({ title: "Senha copiada para a área de transferência!" });
        } else {
            toast({ title: "Nenhuma senha para copiar", variant: "destructive"});
        }
    }

    return (
        <Form {...form}>
            <form action={formAction} className="space-y-4">
                <FormField
                    control={form.control}
                    name="access_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha de Acesso</FormLabel>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Input type="text" placeholder="Defina uma senha para o aluno" {...field} />
                                </FormControl>
                                <Button type="button" variant="outline" size="icon" onClick={copyPassword}><Copy className="h-4 w-4" /></Button>
                                <Button type="button" variant="outline" size="icon" onClick={generatePassword}><RefreshCw className="h-4 w-4" /></Button>
                            </div>
                            <FormDescription>
                                O aluno usará o email <span className="font-semibold">{student.email}</span> e esta senha para acessar o portal.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <input type="hidden" {...form.register("studentId")} />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                   Salvar Senha
                </Button>
            </form>
        </Form>
    )
}
