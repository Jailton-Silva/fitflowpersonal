
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Share2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Workout, WorkoutExercise } from "@/lib/definitions";

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl.includes('youtube.com/watch?v=')) {
        return <p>URL do vídeo inválida.</p>
    }
    const videoId = videoUrl.split('v=')[1].split('&')[0];
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
        <iframe
            width="100%"
            height="315"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    );
};

type WorkoutDetailClientProps = {
    workout: Workout;
    exercise?: WorkoutExercise;
}

export default function WorkoutDetailClient({ workout, exercise }: WorkoutDetailClientProps) {
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

    // Render video button for each exercise
    if (exercise) {
        if (!exercise.video_url) return null;
        
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Ver Vídeo
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{exercise.name}</DialogTitle>
                    </DialogHeader>
                    <VideoPlayer videoUrl={exercise.video_url} />
                </DialogContent>
            </Dialog>
        );
    }
    
    // Render header buttons
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

