
"use client";

import { Workout, WorkoutExercise } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video } from "lucide-react";
import WorkoutDetailClient from "@/app/(app)/workouts/[id]/client-page";

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
        return <p>URL do vídeo inválida ou não fornecida.</p>
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


const ExerciseVideoDialog = ({ exercise }: { exercise: WorkoutExercise }) => {
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
};

// Component for Mobile Card View
export function WorkoutExerciseCard({ workout, exercise }: { workout: Workout, exercise: WorkoutExercise }) {
    return (
        <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex justify-between items-start mb-2">
                <p className="font-bold font-headline text-lg pr-4">{exercise.name}</p>
                 <ExerciseVideoDialog exercise={exercise} />
            </div>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold text-muted-foreground">Séries</p>
                    <p>{exercise.sets || '-'}</p>
                </div>
                    <div>
                    <p className="font-semibold text-muted-foreground">Repetições</p>
                    <p>{exercise.reps || '-'}</p>
                </div>
                    <div>
                    <p className="font-semibold text-muted-foreground">Carga</p>
                    <p>{exercise.load ? `${exercise.load} kg` : '-'}</p>
                </div>
                    <div>
                    <p className="font-semibold text-muted-foreground">Descanso</p>
                    <p>{exercise.rest ? `${exercise.rest} s` : '-'}</p>
                </div>
            </div>
        </div>
    )
}

// Component for Desktop Table Row
export function WorkoutExerciseRow({ workout, exercise }: { workout: Workout, exercise: WorkoutExercise }) {
  return (
    <tr className="hover:bg-muted/50">
      <td className="p-4 font-medium">{exercise.name}</td>
      <td className="p-4 text-center text-muted-foreground">{exercise.sets || '-'}</td>
      <td className="p-4 text-center text-muted-foreground">{exercise.reps || '-'}</td>
      <td className="p-4 text-center text-muted-foreground">{exercise.load ? `${exercise.load} kg` : '-'}</td>
      <td className="p-4 text-center text-muted-foreground">{exercise.rest ? `${exercise.rest} s` : '-'}</td>
      <td className="p-4 text-right">
        <ExerciseVideoDialog exercise={exercise} />
      </td>
    </tr>
  );
}

// Component for Desktop Table Header
export function WorkoutExerciseHeader() {
  return (
    <thead className="border-b">
      <tr className="text-left text-muted-foreground">
        <th className="p-4 font-medium">Exercício</th>
        <th className="p-4 font-medium text-center">Séries</th>
        <th className="p-4 font-medium text-center">Reps</th>
        <th className="p-4 font-medium text-center">Carga</th>
        <th className="p-4 font-medium text-center">Descanso</th>
        <th className="p-4 font-medium text-right">Vídeo</th>
      </tr>
    </thead>
  );
}
