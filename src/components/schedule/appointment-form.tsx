
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse } from 'date-fns';
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Appointment, Student } from "@/lib/definitions";

const formSchema = z.object({
  title: z.string().min(2, "O título é obrigatório."),
  student_id: z.string().min(1, "Selecione um aluno."),
  status: z.enum(["scheduled", "completed", "cancelled"]),
  date: z.string().min(1, "A data é obrigatória."),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)."),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)."),
  description: z.string().optional(),
}).refine(data => data.end_time > data.start_time, {
    message: "A hora final deve ser maior que a hora inicial.",
    path: ["end_time"],
});

type AppointmentFormProps = {
  children?: React.ReactNode;
  students: Pick<Student, 'id' | 'name'>[];
  appointment?: Appointment;
};

export default function AppointmentForm({ children, students, appointment }: AppointmentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!appointment;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      student_id: "",
      status: "scheduled",
      date: "",
      start_time: "",
      end_time: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditMode) {
            const startDate = new Date(appointment.start_time);
            const endDate = new Date(appointment.end_time);
            form.reset({
                title: appointment.title,
                student_id: appointment.student_id,
                status: appointment.status,
                date: format(startDate, "yyyy-MM-dd"),
                start_time: format(startDate, "HH:mm"),
                end_time: format(endDate, "HH:mm"),
                description: appointment.description ?? "",
            });
        } else {
            form.reset({
                title: "",
                student_id: "",
                status: "scheduled",
                date: format(new Date(), "yyyy-MM-dd"),
                start_time: "",
                end_time: "",
                description: "",
            });
        }
    }
  }, [isOpen, appointment, isEditMode, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const supabase = createClient();
    
    const startDateTime = parse(`${values.date} ${values.start_time}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDateTime = parse(`${values.date} ${values.end_time}`, 'yyyy-MM-dd HH:mm', new Date());

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return;
    
    const submissionData = { 
        ...values, 
        trainer_id: trainer.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        description: values.description || null,
    };
    delete (submissionData as any).date;
    
    const { error } = isEditMode 
      ? await supabase.from("appointments").update(submissionData).eq("id", appointment.id)
      : await supabase.from("appointments").insert([submissionData]);

    if (error) {
      toast({
        title: `Erro ao salvar agendamento`,
        description: "Verifique os dados e tente novamente. " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: `Agendamento ${isEditMode ? 'atualizado' : 'criado'} com sucesso.`,
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
          <SheetTitle>{isEditMode ? 'Editar Agendamento' : 'Novo Agendamento'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Atualize os detalhes deste agendamento.' : 'Preencha os campos para criar um novo agendamento.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Treino de Pernas, Consulta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aluno</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o aluno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map(student => (
                          <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
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
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas ou detalhes sobre o agendamento" {...field} value={field.value ?? ''} />
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
                  {isEditMode ? 'Salvar Alterações' : 'Criar Agendamento'}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
