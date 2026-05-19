type AdvertisingBarProps = {
  items: readonly string[];
  isCollapsed: boolean;
  currentIdx: number;
  nextIdx: number;
  isTransitioning: boolean;
};

export default function AdvertisingBar({
  items,
  isCollapsed,
  currentIdx,
  nextIdx,
  isTransitioning,
}: AdvertisingBarProps) {
  return (
    <div
      className={`overflow-hidden bg-neutral-100/90 transition-[max-height,opacity] duration-500 ease-out ${
        isCollapsed ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
      }`}
    >
      <div className="relative flex items-center justify-center px-4 py-2 text-[11px] font-medium tracking-wide text-neutral-800 md:px-8 md:text-xs">
        <div className="relative h-[1.2em] w-full max-w-xl overflow-hidden text-center">
          <span
            className={`absolute left-0 right-0 top-0 truncate ${
              isTransitioning
                ? "-translate-y-3 opacity-0 transition-all duration-[650ms] ease-out"
                : "translate-y-0 opacity-100"
            }`}
          >
            {items[currentIdx]}
          </span>
          <span
            className={`absolute left-0 right-0 top-0 truncate ${
              isTransitioning
                ? "translate-y-0 opacity-100 transition-all duration-[650ms] ease-out"
                : "translate-y-3 opacity-0 transition-none"
            }`}
          >
            {items[nextIdx]}
          </span>
        </div>
        <span className="absolute right-4 tabular-nums text-neutral-500 md:right-8">
          {currentIdx + 1} / {items.length}
        </span>
      </div>
    </div>
  );
}
