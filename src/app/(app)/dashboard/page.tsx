import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Dumbbell, Calendar, Activity } from "lucide-react";
import EngagementChart from "@/components/dashboard/engagement-chart";
import ProgressChart from "@/components/dashboard/progress-chart";

export default async function DashboardPage() {
  const supabase = createClient();
  // In a real app, you would fetch this data from your database
  const stats = {
    totalStudents: 12,
    activeWorkouts: 8,
    weekAppointments: 15,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkouts}</div>
            <p className="text-xs text-muted-foreground">Assigned to students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekAppointments}</div>
            <p className="text-xs text-muted-foreground">+5 scheduled this week</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Physical Evolution</CardTitle>
            <CardDescription>Average student progress over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Student Engagement</CardTitle>
            <CardDescription>Workouts completed vs. scheduled.</CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
