import { createClient } from "@/lib/supabase/server";
import { Student } from "@/lib/definitions";
import { DataTable } from "@/components/students/data-table";
import { columns } from "@/components/students/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import StudentForm from "@/components/students/student-form";

async function getStudents(): Promise<Student[]> {
  const supabase = createClient();
   const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!trainer) {
    return [];
  }

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("trainer_id", trainer.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar alunos:", error);
    return [];
  }
  return data as Student[];
}

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Alunos</h1>
        <StudentForm>
          <Button className="ripple">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Aluno
          </Button>
        </StudentForm>
      </div>
      <DataTable columns={columns} data={students} />
    </div>
  );
}
