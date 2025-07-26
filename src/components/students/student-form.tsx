"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student } from "@/lib/definitions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("Endereço de e-mail inválido."),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(["masculino", "feminino", "outro"]).optional(),
  status: z.enum(["active", "inactive"]),
  goals: z.string().optional(),
  medical_conditions: z.string().optional(),
});

type StudentFormProps = {
  children: React.ReactNode;
  student?: Student;
};

export default function StudentForm({ children, student }: StudentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birth_date: "",
      gender: undefined,
      status: "active",
      goals: "",
      medical_conditions: "",
    },
  });

  useEffect(() => {
    if (student) {
        form.reset({
            name: student.name ?? "",
            email: student.email ?? "",
            phone: student.phone ?? "",
            birth_date: student.birth_date ? new Date(student.birth_date).toISOString().split('T')[0] : "",
            gender: student.gender,
            status: student.status ?? "active",
            goals: student.goals ?? "",
            medical_conditions: student.medical_conditions ?? "",
        });
    } else {
        form.reset({
            name: "",
            email: "",
            phone: "",
            birth_date: "",
            gender: undefined,
            status: "active",
            goals: "",
            medical_conditions: "",
        });
    }
  }, [student, isOpen, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        toast({ title: "Erro de autenticação", description: "Usuário não encontrado.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const { data: trainer, error: trainerError } = await supabase
        .from("trainers")
        .select("id")
        .eq("user_id", user.id)
        .single();
    
    if (trainerError || !trainer) {
        toast({ title: "Erro", description: "Não foi possível encontrar o perfil do treinador.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const submissionData = { ...values, trainer_id: trainer.id };

    const { error } = student
      ? await supabase.from("students").update(submissionData).eq("id", student.id)
      : await supabase.from("students").insert([submissionData]);

    if (error) {
      toast({
        title: "Erro ao salvar aluno",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: `Aluno ${student ? 'atualizado' : 'criado'} com sucesso.`,
      });
      setIsOpen(false);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{student ? "Editar Aluno" : "Adicionar Novo Aluno"}</SheetTitle>
          <SheetDescription>
            {student
              ? "Atualize os detalhes deste aluno."
              : "Preencha o formulário para adicionar um novo aluno à sua lista."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="aluno@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivos</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Perder 10kg, construir músculos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="medical_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições Médicas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Asma, lesão anterior no joelho" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit" disabled={isSubmitting} className="ripple">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
