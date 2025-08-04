
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { StudentPublicPortal } from "@/components/students/student-public-portal";

// This is a server component that verifies access again, then renders the portal
export default async function StudentPortalPage({ params }: { params: { id: string }}) {
    const cookieStore = cookies();
    const supabase = createClient();

    const { data: student } = await supabase
        .from('students')
        .select('id, access_password')
        .eq('id', params.id)
        .single();
    
    if (!student) {
        notFound();
    }
    
    // Double check access logic
    const isAuthenticated = cookieStore.get(`student-${student.id}-auth`)?.value === 'true';
    if(student.access_password && !isAuthenticated) {
        redirect(`/public/student/${student.id}`);
    }

    return (
        <StudentPublicPortal studentId={params.id} />
    );
}
