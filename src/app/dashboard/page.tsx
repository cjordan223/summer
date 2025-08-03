import { SummaryCard } from "@/components/dashboard/summary-card";
import { summaries } from "@/lib/data";

export default function DashboardPage() {
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {summaries.map((summary) => (
        <SummaryCard key={summary.id} summary={summary} />
      ))}
    </div>
  );
}
