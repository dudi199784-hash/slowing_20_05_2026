/** 배송지·연락처 입력/표시용 포맷 */

export type ShippingAddressFields = {
  receiver: string;
  phone: string;
  zipCode: string;
  addressLine1: string;
  addressLine2: string;
};

const PHONE_DIGITS_MAX = 11;

/** 숫자만 추출 (최대 11자리) */
export function phoneDigitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_DIGITS_MAX);
}

/** 한국 휴대폰·일부 지역번호 하이픈 (010-1234-5678) */
export function formatKoreanPhone(value: string): string {
  const d = phoneDigitsOnly(value);
  if (!d) return "";

  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }

  if (d.startsWith("1")) {
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)}-${d.slice(4)}`;
    return `${d.slice(0, 4)}-${d.slice(4, 7)}-${d.slice(7, 11)}`;
  }

  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

export function formatZipCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5);
}

export function isValidKoreanPhone(value: string): boolean {
  const d = phoneDigitsOnly(value);
  if (d.startsWith("010") || d.startsWith("011") || d.startsWith("016") || d.startsWith("017") || d.startsWith("018") || d.startsWith("019")) {
    return d.length === 10 || d.length === 11;
  }
  if (d.startsWith("02")) return d.length >= 9 && d.length <= 10;
  return d.length >= 9 && d.length <= 11;
}

export function isValidZipCode(value: string): boolean {
  return /^\d{5}$/.test(formatZipCode(value));
}

export function buildShippingAddressFull(fields: Pick<ShippingAddressFields, "zipCode" | "addressLine1" | "addressLine2">): string {
  const zip = formatZipCode(fields.zipCode);
  const line1 = fields.addressLine1.trim();
  const line2 = fields.addressLine2.trim();
  const head = zip ? `(${zip}) ${line1}` : line1;
  if (!line2) return head;
  return `${head}, ${line2}`;
}

export function isShippingAddressComplete(fields: ShippingAddressFields): boolean {
  return (
    fields.receiver.trim().length > 0 &&
    isValidKoreanPhone(fields.phone) &&
    isValidZipCode(fields.zipCode) &&
    fields.addressLine1.trim().length > 0 &&
    fields.addressLine2.trim().length > 0
  );
}

/** API Member → 폼 초기값 */
export function shippingFromMember(member: {
  shippingReceiver?: string | null;
  shippingPhone?: string | null;
  shippingZipCode?: string | null;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingAddress?: string | null;
  username?: string | null;
}): ShippingAddressFields {
  const zip = member.shippingZipCode?.trim() ?? "";
  const line1 = member.shippingAddressLine1?.trim() ?? "";
  const line2 = member.shippingAddressLine2?.trim() ?? "";

  if (zip || line1 || line2) {
    return {
      receiver: member.shippingReceiver?.trim() ?? member.username?.trim() ?? "",
      phone: formatKoreanPhone(member.shippingPhone ?? ""),
      zipCode: formatZipCode(zip),
      addressLine1: line1,
      addressLine2: line2,
    };
  }

  const legacy = member.shippingAddress?.trim() ?? "";
  const zipMatch = legacy.match(/^\((\d{5})\)\s*([\s\S]*)$/);
  if (zipMatch) {
    const rest = zipMatch[2] ?? "";
    const comma = rest.indexOf(", ");
    if (comma >= 0) {
      return {
        receiver: member.shippingReceiver?.trim() ?? member.username?.trim() ?? "",
        phone: formatKoreanPhone(member.shippingPhone ?? ""),
        zipCode: zipMatch[1],
        addressLine1: rest.slice(0, comma),
        addressLine2: rest.slice(comma + 2),
      };
    }
    return {
      receiver: member.shippingReceiver?.trim() ?? member.username?.trim() ?? "",
      phone: formatKoreanPhone(member.shippingPhone ?? ""),
      zipCode: zipMatch[1],
      addressLine1: rest,
      addressLine2: "",
    };
  }

  return {
    receiver: member.shippingReceiver?.trim() ?? member.username?.trim() ?? "",
    phone: formatKoreanPhone(member.shippingPhone ?? ""),
    zipCode: "",
    addressLine1: legacy,
    addressLine2: "",
  };
}

export function shippingToApiBody(fields: ShippingAddressFields) {
  const zipCode = formatZipCode(fields.zipCode);
  const addressLine1 = fields.addressLine1.trim();
  const addressLine2 = fields.addressLine2.trim();
  return {
    shippingReceiver: fields.receiver.trim(),
    shippingPhone: formatKoreanPhone(fields.phone),
    shippingZipCode: zipCode,
    shippingAddressLine1: addressLine1,
    shippingAddressLine2: addressLine2,
    shippingAddress: buildShippingAddressFull({ zipCode, addressLine1, addressLine2 }),
  };
}
