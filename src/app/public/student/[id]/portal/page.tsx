
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import StudentLoginForm from "./client-page";

async function getStudent(studentId: string) {
    const supabase = await createClient();
    const { data: student, error } = await supabase
        .from('students')
        .select('id, name, email, access_password')
        .eq('id', studentId)
        .single();

    if (error || !student || !student.access_password) {
        // Se não houver aluno, ou se a senha de acesso não estiver configurada,
        // a página do portal não pode ser acessada.
        notFound();
    }

    return student;
}

export default async function StudentPortalLoginPage({ params }: { params: { id: string } }) {
    const student = await getStudent(params.id);
    const cookieStore = cookies();

    const isAuthenticated = cookieStore.get(`student-${student.id}-auth`)?.value === "true";

    if (isAuthenticated) {
        // Idealmente, redirecionar para uma página de dashboard do aluno.
        // Por agora, mostraremos uma mensagem de sucesso.
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
                <div className="p-8 bg-card rounded-xl shadow-lg text-center max-w-md">
                    <h1 className="text-2xl font-bold font-headline mb-4">Acesso ao Portal do Aluno</h1>
                    <p className="text-muted-foreground mb-2">Bem-vindo(a) de volta, <span className="font-semibold text-foreground">{student.name}</span>!</p>
                    <p className="text-muted-foreground">Você já está autenticado e pode visualizar seus treinos.</p>
                     {/* Futuramente, adicionar um link para o dashboard do aluno */}
                </div>
            </div>
        );
    }

    return <StudentLoginForm student={student} />;
}
