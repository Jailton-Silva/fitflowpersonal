
import { StudentPasswordForm } from "@/components/students/student-password-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function checkStudentAccess(studentId: string) {
    const supabase = createClient();
    const { data: student, error } = await supabase
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();
    
    // If there is no student or an error, we can't proceed.
    // In a real app, you might want a more user-friendly error page.
    if (error || !student) {
        return { needsPassword: true }; // Fallback to asking for password
    }

    // If the student does not have a password set, grant access immediately.
    if (!student.access_password) {
        // To avoid re-checking, we can set the cookie here as well
        cookies().set(`student-${studentId}-auth`, 'true', {
            path: `/`,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        return { needsPassword: false };
    }

    // If there is a password, the form needs to be shown.
    return { needsPassword: true };
}


export default async function PublicStudentPage({ params }: { params: { id: string } }) {
    const { needsPassword } = await checkStudentAccess(params.id);

    if (!needsPassword) {
        redirect(`/public/student/${params.id}/portal`);
    }
    
    return (
        <StudentPasswordForm studentId={params.id} />
    )
}
