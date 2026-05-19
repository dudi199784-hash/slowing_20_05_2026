import Link from "next/link";

type Item = {
  label: string;
  href?: string;
  onPress?: () => void;
};

type MenuDropdownProps = {
  items: Item[];
  onClose?: () => void;
};

export default function MenuDropdown({ items, onClose }: MenuDropdownProps) {
  return (
    <div
      className="fixed top-24 right-4 z-[60] w-48 rounded-lg border border-neutral-200 bg-white text-neutral-900 shadow-lg md:right-8"
      role="menu"
    >
      <ul className="py-2 text-sm">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            {item.onPress ? (
              <button
                type="button"
                role="menuitem"
                className="w-full text-left"
                onClick={() => {
                  item.onPress?.();
                  onClose?.();
                }}
              >
                {item.label}
              </button>
            ) : item.href ? (
              <Link href={item.href} role="menuitem" onClick={() => onClose?.()}>
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
