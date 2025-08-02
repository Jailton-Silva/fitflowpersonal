
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Changed to client
import { Student } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import StudentForm from "@/components/students/student-form";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { StudentCard, StudentTableRow, StudentTableHeader } from "@/components/students/student-list-components";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getStudents = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("trainer_id", trainer.id)
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao buscar alunos:", error);
      } else {
        setStudents(data as Student[]);
        setFilteredStudents(data as Student[]);
      }
      setIsLoading(false);
    };

    getStudents();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = students.filter((item) => {
      return item.name.toLowerCase().includes(lowercasedFilter);
    });
    setFilteredStudents(filteredData);
  }, [searchTerm, students]);

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

      <div className="rounded-md border bg-card">
        <div className="p-4">
            <Input
              placeholder="Filtrar por nome..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="max-w-sm"
            />
        </div>

        {isLoading ? (
            <div className="p-4 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden">
                {filteredStudents.length > 0 ? (
                  <div className="divide-y divide-border">
                    {filteredStudents.map((student) => <StudentCard key={student.id} student={student} />)}
                  </div>
                ) : (
                  <p className="p-4 text-center text-muted-foreground">Nenhum aluno encontrado.</p>
                )}
            </div>
            {/* Desktop View */}
            <div className="hidden md:block">
               <table className="w-full text-sm">
                  <StudentTableHeader />
                  <tbody className="divide-y divide-border">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => <StudentTableRow key={student.id} student={student} />)
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          Nenhum aluno encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
