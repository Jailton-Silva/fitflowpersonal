import { Suspense } from 'react';
import ResetPasswordForm from './reset-password-form';
import { Skeleton } from '@/components/ui/skeleton';

function ResetPasswordSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="mx-auto max-w-sm w-full p-6">
                <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mx-auto mb-6" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
                 <Skeleton className="h-4 w-1/3 mx-auto mt-4" />
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
        <ResetPasswordForm />
    </Suspense>
  );
}
