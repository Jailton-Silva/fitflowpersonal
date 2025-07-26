import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Workout } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Dumbbell } from "lucide-react";

async function getWorkouts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*, students(name)");
  
  if (error) {
    console.error("Error fetching workouts:", error);
    return [];
  }
  return data;
}

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Workout Plans</h1>
        <Button asChild className="ripple">
          <Link href="/workouts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Workout
          </Link>
        </Button>
      </div>
      {workouts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout: any) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription>
                  For: {workout.students?.name ?? "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  <span>
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full">View Plan</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Workouts Yet</h2>
          <p className="text-muted-foreground mt-2">
            Get started by creating a new workout plan.
          </p>
          <Button asChild className="mt-4 ripple">
            <Link href="/workouts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Workout
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
