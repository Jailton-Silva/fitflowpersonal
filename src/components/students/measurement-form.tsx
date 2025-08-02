
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Measurement } from "@/lib/definitions";

const formSchema = z.object({
  weight: z.preprocess((val) => val === '' ? undefined : Number(val), z.number({ required_error: "O peso é obrigatório."}).positive("O peso deve ser um número positivo.")),
  height: z.preprocess((val) => val === '' ? undefined : Number(val), z.number({ required_error: "A altura é obrigatória."}).positive("A altura deve ser um número positivo.")),
  body_fat: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0, "O percentual de gordura não pode ser negativo.").optional()),
  notes: z.string().optional(),
});

type MeasurementFormProps = {
  children: React.ReactNode;
  studentId: string;
  measurement?: Measurement;
};

export default function MeasurementForm({ children, studentId, measurement }: MeasurementFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!measurement;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        weight: undefined,
        height: undefined,
        body_fat: undefined,
        notes: "",
    },
  });

  useEffect(() => {
    if (isOpen && measurement) {
      form.reset({
        weight: measurement.weight ?? undefined,
        height: measurement.height ?? undefined,
        body_fat: measurement.body_fat ?? undefined,
        notes: measurement.notes ?? "",
      });
    } else if (isOpen && !measurement) {
       form.reset({
            weight: undefined,
            height: undefined,
            body_fat: undefined,
            notes: "",
        });
    }
  }, [isOpen, measurement, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const supabase = createClient();
    
    const submissionData = { 
        ...values, 
        student_id: studentId,
        body_fat: values.body_fat || null,
        notes: values.notes || null,
    };
    
    const { error } = isEditMode 
      ? await supabase.from("measurements").update(submissionData).eq("id", measurement.id)
      : await supabase.from("measurements").insert([submissionData]);


    if (error) {
      toast({
        title: `Erro ao salvar avaliação`,
        description: "Verifique os dados e tente novamente. " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: `Avaliação física ${isEditMode ? 'atualizada' : 'registrada'} com sucesso.`,
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
          <SheetTitle>{isEditMode ? 'Editar Avaliação Física' : 'Registrar Nova Avaliação Física'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Atualize as medidas desta avaliação.' : 'Preencha os campos abaixo com as novas medidas do aluno.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="80.5" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="175" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
              control={form.control}
              name="body_fat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gordura Corporal (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="18.2" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas da Avaliação</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações sobre a avaliação, dobras cutâneas, etc." {...field} value={field.value ?? ''} />
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
                  Salvar Avaliação
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
