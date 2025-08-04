
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StudentPasswordForm } from "@/components/students/student-password-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentPublicPortal from "@/components/students/student-public-portal";

async function getStudent(studentId: string) {
    const supabase = createClient();
    const { data: student, error } = await supabase
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();
    
    if (error || !student) {
        notFound();
    }

    return student;
}


export default async function StudentPublicAccessPage({ params }: { params: { id: string } }) {
    const student = await getStudent(params.id);
    const cookieStore = cookies();
    const isAuthenticated = cookieStore.get(`student-${params.id}-auth`)?.value === "true";

    // If student has no password, or is already authenticated, show the portal
    if (!student.access_password || isAuthenticated) {
        return <StudentPublicPortal studentId={params.id} />
    }

    // Otherwise, show the password form
    return <StudentPasswordForm studentId={params.id} />;
}
