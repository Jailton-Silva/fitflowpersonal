
import StudentPublicPortal from "@/components/students/student-public-portal";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

async function checkAuth(studentId: string) {
    const supabase = createClient();

    // First check if there is an access_password
    const { data: student, error } = await supabase
        .from('students')
        .select('access_password')
        .eq('id', studentId)
        .single();
    
    if (error || !student) {
        notFound();
    }

    // If there is no password, access is granted
    if (!student.access_password) {
        return true;
    }

    // If there is a password, check for the auth cookie
    const cookieStore = cookies();
    const authCookie = cookieStore.get(`student-${studentId}-auth`);

    return authCookie?.value === 'true';
}


export default async function StudentPortalPage({ params }: { params: { id: string }}) {
    const isAuthenticated = await checkAuth(params.id);

    if (!isAuthenticated) {
        notFound(); // Or redirect to password form
    }
    
    return <StudentPublicPortal studentId={params.id} />
}
