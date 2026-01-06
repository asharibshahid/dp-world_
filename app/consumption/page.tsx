import Link from "next/link";
import MobileHeader from "../../components/MobileHeader";

export default function Page() {
  return (
    <section className="space-y-6 text-white">
      <MobileHeader title="Consumption" />

      <div className="rounded-[26px] bg-white p-5 text-slate-900 shadow-[0_18px_40px_rgba(8,6,34,0.25)]">
        <h1 className="text-lg font-semibold text-slate-900">
          Consumption
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          This view is coming soon. Visit vessel schedules for the live
          prototype.
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
