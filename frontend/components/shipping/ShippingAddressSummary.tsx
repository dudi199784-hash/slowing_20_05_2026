import { formatKoreanPhone, formatZipCode } from "@/lib/shipping/format";

type ShippingAddressSummaryProps = {
  receiver?: string | null;
  phone?: string | null;
  zipCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  /** 구버전 한 줄 주소 */
  shippingAddress?: string | null;
  className?: string;
};

export default function ShippingAddressSummary({
  receiver,
  phone,
  zipCode,
  addressLine1,
  addressLine2,
  shippingAddress,
  className = "",
}: ShippingAddressSummaryProps) {
  const zip = formatZipCode(zipCode ?? "");
  const line1 = addressLine1?.trim() ?? "";
  const line2 = addressLine2?.trim() ?? "";
  const legacy = shippingAddress?.trim() ?? "";

  if (!receiver && !phone && !zip && !line1 && !line2 && !legacy) {
    return null;
  }

  const phoneFmt = phone ? formatKoreanPhone(phone) : "";

  return (
    <div className={`text-sm text-neutral-600 ${className}`.trim()}>
      {(receiver || phoneFmt) && (
        <p>
          <span className="font-medium text-neutral-800">{receiver ?? "—"}</span>
          {phoneFmt ? (
            <>
              {" "}
              · <span className="tabular-nums">{phoneFmt}</span>
            </>
          ) : null}
        </p>
      )}
      {zip || line1 || line2 ? (
        <p className="mt-1 leading-relaxed text-neutral-600">
          {zip ? <span className="tabular-nums text-neutral-500">({zip})</span> : null}
          {zip && line1 ? " " : null}
          {line1}
          {line2 ? (
            <>
              <br />
              <span className="text-neutral-700">{line2}</span>
            </>
          ) : null}
        </p>
      ) : legacy ? (
        <p className="mt-1 leading-relaxed">{legacy}</p>
      ) : null}
    </div>
  );
}
