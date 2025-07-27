
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { StudentPasswordForm } from "@/components/students/student-password-form";

async function getStudentDetails(studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

    if (error || !data) {
        notFound();
    }
    return data;
}

export default async function PublicStudentPage({ params }: { params: { id: string } }) {
    const student = await getStudentDetails(params.id);

    // Se o aluno não tiver uma senha de acesso, o acesso é livre.
    if (!student.access_password) {
        // TODO: Render the student portal content directly
        return <div>Portal do Aluno para {student.name} (acesso livre)</div>;
    }

    const cookieStore = cookies();
    const authCookie = cookieStore.get(`student-auth-${params.id}`);

    if (authCookie?.value !== "true") {
        return <StudentPasswordForm studentId={params.id} />;
    }
    
    // TODO: Render the student portal content for authorized user
    return (
        <div>
           <h1>Portal do Aluno: {student.name}</h1>
           <p>Acesso autorizado!</p>
        </div>
    );
}
