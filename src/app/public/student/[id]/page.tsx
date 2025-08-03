
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Student } from "@/lib/definitions";
import { StudentPasswordForm } from "@/components/students/student-password-form";
import StudentPublicPortal from "@/components/students/student-public-portal";

async function getStudentDetails(studentId: string) {
    const supabase = createClient();
    const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
    
    if (error || !student) {
        notFound();
    }
    return student as Student;
}

export default async function PublicStudentPage({ params }: { params: { id: string } }) {
    const student = await getStudentDetails(params.id);

    // If student has no password, show the portal directly
    if (!student.access_password) {
        return <StudentPublicPortal studentId={params.id} />
    }

    // Check for auth cookie
    const cookieStore = cookies();
    const authCookie = cookieStore.get(`student_auth_${params.id}`);

    if (authCookie?.value === 'true') {
        return <StudentPublicPortal studentId={params.id} />
    }

    // If it has a password and user is not authenticated, show password form
    return <StudentPasswordForm studentId={params.id} />;
}
