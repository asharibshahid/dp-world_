type MobileHeaderProps = {
  title?: string;
};

export default function MobileHeader({ title }: MobileHeaderProps) {
  return (
    <div className="grid grid-cols-[40px,1fr,40px] items-center gap-3">
      <button
        type="button"
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 7H20M4 12H20M4 17H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <span className="text-center text-base font-semibold leading-snug text-white">
        {title ?? "DP World"}
      </span>
      <div className="h-10 w-10" aria-hidden="true" />
    </div>
  );
}
