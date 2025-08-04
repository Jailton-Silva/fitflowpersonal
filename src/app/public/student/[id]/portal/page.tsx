
import PublicHeader from "@/components/layout/public-header";
import StudentPublicPortal from "@/components/students/student-public-portal";

// This page must be async to correctly handle server-side operations and dynamic APIs like params
export default async function StudentPortalPage({ params }: { params: { id: string } }) {
  
  // Awaiting a promise here (even a simple one) can help Next.js correctly
  // sequence the rendering and avoid race conditions with dynamic APIs.
  await new Promise(resolve => setTimeout(resolve, 0));

  return (
    <>
      <PublicHeader studentId={params.id} />
      <StudentPublicPortal studentId={params.id} />
    </>
  );
}
