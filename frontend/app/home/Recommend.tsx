import Link from "next/link";

import MediaSlot from "@/components/media/MediaSlot";
import { recommendMedia } from "@/config/media";
import { designHrefForProduct } from "@/config/studioProducts";
import { boardCardHoverShell, boardCardListItem } from "@/lib/boardCardHover";

export default function Recommend() {
  return (
    <div className="w-full max-w-[100vw]">
      <div className="mx-auto mt-20 grid w-full max-w-[min(100%,96rem)] grid-cols-1 gap-8 overflow-visible px-6 pb-20 md:grid-cols-4 md:px-10">
        {recommendMedia.map((item) => (
          <div key={item.id} className={`${boardCardListItem} min-h-0`}>
            <Link
              href={designHrefForProduct(item.id)}
              className={`${boardCardHoverShell} group block h-full`}
            >
              <div className="relative h-full min-h-[min(320px,50vh)] w-full overflow-hidden border border-neutral-200 bg-white">
                <span className="absolute left-0 top-0 z-10 border-b border-r border-neutral-200/90 bg-white/92 px-3 py-2.5 text-[11px] font-medium tracking-[0.14em] text-neutral-800 backdrop-blur-[2px] transition-[background-color,color,box-shadow] duration-500 ease-in-out group-hover:bg-neutral-900 group-hover:text-white group-hover:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)] md:px-3.5 md:py-3 md:text-xs">
                  {item.label}
                </span>
                <div className="absolute inset-0">
                  <MediaSlot
                    media={item.media}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="h-full bg-white"
                    objectClassName="object-contain object-center p-4 pt-10"
                    fallback={
                      <span className="text-sm font-medium text-neutral-700">
                        {item.label}
                      </span>
                    }
                  />
                </div>
                <span className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent px-3 py-3 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {item.label} 시안 만들기 →
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
