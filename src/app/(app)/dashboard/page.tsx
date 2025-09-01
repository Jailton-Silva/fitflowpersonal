import { getDashboardData } from "@/actions/get-dashboard-data";
import { UserMetrics } from "./_components/user-metrics";
import { createClient } from "@/lib/supabase/server";
import { format, subDays } from "date-fns";
import { AdminMetrics } from "./_components/admin-metrics";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: trainer } = await supabase
  .from('trainers')
  .select('role')
  .eq('user_id', user?.id)
  .single();

  const to = searchParams.to || format(new Date(), 'yyyy-MM-dd');
  const from = searchParams.from || format(subDays(new Date(), 180), 'yyyy-MM-dd'); // Default to last 6 months

  const data = await getDashboardData({
    from,
    to,
  });

  const showOnboarding = data!.totalStudents === 0;

  return (
    <div className="space-y-6">
      { trainer?.role !== "admin" ? (
        <AdminMetrics
          from={from}
          to={to}
          data={data}
        />
      ) : 
        <UserMetrics
          from={from}
          to={to}
          showOnboarding={showOnboarding}
          data={data}
        />
      }
    </div>
  );
}
