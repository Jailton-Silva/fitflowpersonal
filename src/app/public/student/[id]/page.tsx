
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { StudentPasswordForm } from "@/components/students/student-password-form";

async function getStudent(studentId: string) {
    const supabase = createClient();
    const { data: student, error } = await supabase
        .from('students')
        .select('id, name, access_password')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        notFound();
    }
    return student;
}

export default async function StudentAccessPage({ params }: { params: { id: string }}) {
    const student = await getStudent(params.id);

    // If student is already authenticated via cookie, redirect to portal
    const cookieStore = cookies();
    const authCookie = cookieStore.get(`student-${student.id}-auth`);
    if (authCookie?.value === 'true') {
        redirect(`/public/student/${student.id}/portal`);
    }

    // If student has no password, they have free access. Set cookie and redirect.
    if (!student.access_password) {
        cookieStore.set(`student-${student.id}-auth`, 'true', { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
        redirect(`/public/student/${student.id}/portal`);
    }
    
    // If password is set and user is not authenticated, show password form
    return <StudentPasswordForm studentId={student.id} />;
}
