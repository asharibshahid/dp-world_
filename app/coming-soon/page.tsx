import Link from "next/link";
import MobileHeader from "../../components/MobileHeader";

export default function ComingSoonPage() {
  return (
    <section className="space-y-6 text-white">
      <MobileHeader title="Coming Soon" />

      <div className="rounded-[26px] bg-white p-5 text-slate-900 shadow-[0_18px_40px_rgba(8,6,34,0.25)]">
        <h1 className="text-lg font-semibold text-slate-900">Coming Soon</h1>
        <p className="mt-2 text-sm text-slate-600">
          This feature is under construction. Return to vessel schedules or
          serves route to explore the live prototype.
        </p>
        <Link
          href="/vessel-schedules"
          className="mt-4 inline-flex text-sm font-semibold text-[#241B6A]"
        >
          Go to Vessel Schedules
        </Link>
      </div>
    </section>
  );
}
