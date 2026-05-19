type MemberDesignMetricsRowProps = {
  viewsDisplay: string;
  likesDisplay: string;
};

export default function MemberDesignMetricsRow({
  viewsDisplay,
  likesDisplay,
}: MemberDesignMetricsRowProps) {
  return (
    <p className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-3 text-xs text-neutral-600">
      <span>
        <span className="font-medium text-neutral-800">조회</span>{" "}
        {viewsDisplay}
      </span>
      <span className="select-none text-neutral-300" aria-hidden>
        ·
      </span>
      <span>
        <span className="font-medium text-neutral-800">좋아요</span>{" "}
        {likesDisplay}
      </span>
    </p>
  );
}
