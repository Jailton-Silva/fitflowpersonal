
import { createClient } from "@/lib/supabase/server";
import { StudentPasswordForm } from "@/components/students/student-password-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getStudent(studentId: string) {
    const supabase = createClient();
    const { data: student, error } = await supabase.from('students').select('access_password').eq('id', studentId).single();
    if (error) {
        console.error("Student not found:", error);
        return null;
    }
    return student;
}

export default async function PublicStudentPage({ params }: { params: { id: string } }) {
    const student = await getStudent(params.id);

    if (!student) {
        return <p>Aluno não encontrado.</p>;
    }
    
    // If student has no password, grant access immediately
    if (!student.access_password) {
        const cookieStore = cookies();
        cookieStore.set(`student-${params.id}-auth`, "true", { path: "/", maxAge: 3600 }); // Expires in 1 hour
        redirect(`/public/student/${params.id}/portal`);
    }

    // If there's a password, check if user is already authenticated via cookie
    const cookieStore = cookies();
    const isAuthenticated = cookieStore.get(`student-${params.id}-auth`)?.value === "true";

    if (isAuthenticated) {
        redirect(`/public/student/${params.id}/portal`);
    }

    return <StudentPasswordForm studentId={params.id} />;
}
