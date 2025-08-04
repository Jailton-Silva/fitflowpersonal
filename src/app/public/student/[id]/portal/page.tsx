
import StudentPublicPortal from "@/components/students/student-public-portal";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PublicHeader from "@/components/layout/public-header";

export default function StudentPortalPage({ params }: { params: { id: string } }) {
    return (
        <>
            <PublicHeader studentId={params.id} />
            <Suspense fallback={<div className="flex flex-col min-h-screen bg-muted p-4 sm:p-8"><Skeleton className="max-w-4xl mx-auto w-full h-96" /></div>}>
                <StudentPublicPortal studentId={params.id} />
            </Suspense>
        </>
    );
}
