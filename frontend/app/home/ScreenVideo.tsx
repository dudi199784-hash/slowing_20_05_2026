import MediaSlot from "@/components/media/MediaSlot";
import { heroMedia } from "@/config/media";

export default function ScreenVideo() {
  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden bg-neutral-900"
      aria-label="메인 비주얼"
    >
      <MediaSlot
        media={heroMedia}
        className="absolute inset-0 size-full"
        sizes="100vw"
        objectClassName="object-cover object-center"
        fallback={
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-neutral-100 px-4 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
              hero slot
            </span>
            <h2 className="text-lg font-medium md:text-xl">메인 비주얼</h2>
            <p className="max-w-md text-xs text-neutral-500 md:text-sm">
              <code className="rounded bg-neutral-200/80 px-1.5 py-0.5">config/media.ts</code>의{" "}
              <code className="rounded bg-neutral-200/80 px-1.5 py-0.5">heroMedia</code>에
              이미지 경로를 넣으면 전체 화면으로 표시됩니다.
            </p>
          </div>
        }
      />
    </section>
  );
}
