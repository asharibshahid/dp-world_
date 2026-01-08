import Image from "next/image";
import Link from "next/link";
import CountrySelector from "../components/CountrySelector";
import MobileHeader from "../components/MobileHeader";

export default function Home() {
  return (
    <section className="space-y-5 text-white">
      <div className="space-y-2">
        <MobileHeader title="Dashboard" />
        <div className="flex justify-end">
          <CountrySelector />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
          Mobile Operations
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/vessel-schedules"
          className="relative flex min-h-[140px] h-full flex-col justify-between rounded-[22px] bg-[#1f6fff] p-4 text-white shadow-[0_16px_35px_rgba(31,111,255,0.35)]"
        >
          <p className="text-sm font-semibold">Vessel Schedules</p>
          <span className="text-xs text-white/80">Live ETA + ETD</span>
        </Link>

        <Link
          href="/pots"
          className="relative flex min-h-[140px] h-full flex-col justify-between rounded-[22px] bg-[#f28c28] p-4 text-white shadow-[0_16px_35px_rgba(242,140,40,0.35)]"
        >
          <p className="text-sm font-semibold">Ports Consumption</p>
          <Image
            src="/icons/crane.png"
            alt="Crane"
            width={36}
            height={36}
            className="absolute bottom-4 right-4 object-contain"
          />
        </Link>

        <Link
          href="/serves-route"
          className="relative flex min-h-[140px] h-full flex-col justify-between rounded-[22px] bg-[#ff5b8a] p-4 text-white shadow-[0_16px_35px_rgba(255,91,138,0.35)]"
        >
          <p className="text-sm font-semibold">Serves Route</p>
          <Image
            src="/icons/ship.png"
            alt="Ship"
            width={36}
            height={36}
            className="absolute bottom-4 right-4 object-contain"
          />
        </Link>

        <Link
          href="/container-tracking"
          className="relative flex min-h-[140px] h-full flex-col justify-between rounded-[22px] bg-[#8e95a8] p-4 text-white shadow-[0_16px_35px_rgba(142,149,168,0.35)]"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold">B/L Tracking</p>
            <p className="text-xs text-white/80">Container Tracking</p>
          </div>
          <Image
            src="/icons/container.png"
            alt="Container"
            width={36}
            height={36}
            className="absolute bottom-4 right-4 object-contain"
          />
        </Link>
      </div>
    </section>
  );
}

