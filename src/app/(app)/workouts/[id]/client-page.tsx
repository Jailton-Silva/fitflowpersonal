
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Workout } from "@/lib/definitions";

type WorkoutDetailClientProps = {
    workout: Workout;
}

export default function WorkoutDetailClient({ workout }: WorkoutDetailClientProps) {
    const { toast } = useToast();

    const handleShare = () => {
        // Ensure this code runs only in the browser
        if (typeof window !== 'undefined') {
            const url = `${window.location.origin}/public/workout/${workout.id}`;
            navigator.clipboard.writeText(url);
            toast({
                title: "Link Copiado!",
                description: "O link de compartilhamento do treino foi copiado para a área de transferência.",
            });
        }
    }
    
    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
            </Button>
            <Button asChild className="ripple">
                <Link href={`/workouts/${workout.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Link>
            </Button>
        </div>
    );
}
