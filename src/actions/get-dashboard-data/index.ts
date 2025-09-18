"use server";

import type { EngagementData } from "@/components/dashboard/engagement-chart";
import type { ProgressData } from "@/components/dashboard/progress-chart";
import { createClient } from "@/lib/supabase/server";
import { differenceInDays, endOfWeek, format, parse, startOfWeek, subDays, sub } from "date-fns";
import { cookies } from "next/headers";

interface GetDashboardData {
  to: string;
  from: string;
}

export const getDashboardData = async ({ from, to }: GetDashboardData) => {
  const cookieStore = cookies();
  const db = createClient(cookieStore);
  const { data: { user } } = await db.auth.getUser();

  const emptyData = {
    totalStudents: 0,
    activeWorkouts: 0,
    weekAppointments: 0,
    studentsCountLastMonth: 0,
    progressData: [],
    engagementData: [],
    overallEngagementRate: 0,
    mostEngagedStudents: [],
    lowActivityStudents: [],
  };

  if (!user) return emptyData;

  const { data: trainer } = await db
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!trainer) return emptyData;

  const trainerId = trainer.id;
  const today = new Date();
  const fromDate = parse(from, 'yyyy-MM-dd', new Date());
  const toDate = parse(to, 'yyyy-MM-dd', new Date());

  const { data: allStudents, count: totalStudents } = await db
    .from('students')
    .select('id, name, avatar_url, created_at', { count: 'exact' })
    .eq('trainer_id', trainerId)
    .eq('status', 'active')
  
  if (!allStudents) {
    console.error("Dashboard data error: could not fetch students");
    return emptyData;
  }

  const studentIdList = allStudents.map(student => student.id)

  if (studentIdList.length === 0) {
    return {
      ...emptyData,
      totalStudents: totalStudents ?? 0,
    };
  }

  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  const lastMonth = subDays(today, 30);

  const [
    studentsCountLastMonthResult,
    activeWorkoutsResult,
    weekAppointmentsResult,
    measurementsResult,
    appointmentsResult,
    recentSessionsResult,
  ] = await Promise.all([
    db.from('students').select('*', { count: 'exact', head: true }).eq('trainer_id', trainerId).gte('created_at', lastMonth.toISOString()),
    db.from('workouts').select('*', { count: 'exact', head: true }).eq('trainer_id', trainerId),
    db.from('appointments').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId).gte('start_time', startOfCurrentWeek.toISOString()).lte('end_time', endOfCurrentWeek.toISOString()),
    db.from('measurements').select('created_at, weight, body_fat').in('student_id', studentIdList).gte('created_at', fromDate.toISOString()).lte('created_at', toDate.toISOString()).order('created_at', { ascending: true }),
    db.from('appointments').select('start_time, status').eq('trainer_id', trainerId).gte('start_time', fromDate.toISOString()).lte('end_time', toDate.toISOString()),
    db.from('workout_sessions').select('student_id, completed_at, started_at').in('student_id', studentIdList).gte('started_at', subDays(new Date(), 30).toISOString()),
  ]);

  const studentsCountLastMonth = studentsCountLastMonthResult.count ?? 0;
  const activeWorkouts = activeWorkoutsResult.count ?? 0;
  const weekAppointments = weekAppointmentsResult.count ?? 0;
  const measurements = measurementsResult.data ?? [];
  const appointments = appointmentsResult.data ?? [];
  const recentSessions = recentSessionsResult.data ?? [];

  const monthlyProgress: { [key: string]: { weights: number[], fats: number[] } } = {};
  measurements.forEach(m => {
    const month = format(new Date(m.created_at), 'yyyy-MM');
    if (!monthlyProgress[month]) {
      monthlyProgress[month] = { weights: [], fats: [] };
    }
    if (m.weight) monthlyProgress[month].weights.push(m.weight);
    if (m.body_fat) monthlyProgress[month].fats.push(m.body_fat);
  });

  const progressData: ProgressData = Object.entries(monthlyProgress).map(([month, data]) => ({
    name: format(parse(month, 'yyyy-MM', new Date()), 'MMM/yy'),
    weight: data.weights.length ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length : 0,
    bodyFat: data.fats.length ? data.fats.reduce((a, b) => a + b, 0) / data.fats.length : 0,
  }));

  const monthlyEngagement: { [key: string]: { scheduled: number, completed: number } } = {};
  appointments.forEach(apt => {
    const month = format(new Date(apt.start_time), 'yyyy-MM');
    if (!monthlyEngagement[month]) {
      monthlyEngagement[month] = { scheduled: 0, completed: 0 };
    }
    monthlyEngagement[month].scheduled++;
    if (apt.status === 'completed') {
      monthlyEngagement[month].completed++;
    }
  });

  const engagementData: EngagementData = Object.entries(monthlyEngagement).map(([month, data]) => ({
    month: format(parse(month, 'yyyy-MM', new Date()), 'MMM/yy'),
    completed: data.completed,
    scheduled: data.scheduled
  }));

  const scheduledTotal = engagementData.reduce((acc, curr) => acc + curr.scheduled, 0);
  const completedTotal = engagementData.reduce((acc, curr) => acc + curr.completed, 0);
  const overallEngagementRate = scheduledTotal > 0 ? (completedTotal / scheduledTotal) * 100 : 0;

  const studentActivity: { [studentId: string]: { last_activity: string, completed_count: number } } = {};
  recentSessions.forEach(session => {
    if (!studentActivity[session.student_id]) {
      studentActivity[session.student_id] = { last_activity: session.started_at, completed_count: 0 };
    }
    if (session.completed_at) {
      studentActivity[session.student_id].completed_count++;
    }
    const currentLastActivity = studentActivity[session.student_id].last_activity;
    const sessionActivityDate = session.completed_at || session.started_at;

    if (new Date(sessionActivityDate) > new Date(currentLastActivity)) {
      studentActivity[session.student_id].last_activity = sessionActivityDate;
    }
  });

  const mostEngagedStudents = allStudents
  .map(student => ({ ...student, completed_count: studentActivity[student.id]?.completed_count || 0 }))
  .sort((a, b) => b.completed_count - a.completed_count)
  .slice(0, 3);

  const lowActivityStudents = allStudents
  .filter(s => {
    const lastActivityDate = studentActivity[s.id]?.last_activity;
    const studentCreationDate = new Date(s.created_at);
    // Only consider students created more than 7 days ago to avoid flagging new students
    if (differenceInDays(today, studentCreationDate) < 7) {
      return false;
    }
    if (!lastActivityDate) return true; // No activity at all
    return differenceInDays(today, new Date(lastActivityDate)) > 15;
  })
  .slice(0, 5);

  return {
    totalStudents: totalStudents ?? 0,
    activeWorkouts,
    weekAppointments,
    studentsCountLastMonth,
    progressData,
    engagementData,
    overallEngagementRate,
    mostEngagedStudents,
    lowActivityStudents,
  };
};
