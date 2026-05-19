import MenuDropdown from "@/components/header/MenuDropdown";

type MenuProps = {
  onClose?: () => void;
};

export default function Menu({ onClose }: MenuProps) {
  const items = [
    { label: "상품 소개", href: "/shop/intro" },
    { label: "구경하기", href: "/shop/browse" },
    { label: "인기 상품", href: "/shop/popular" },
    { label: "디자인 스튜디오", href: "/design" },
    { label: "공지사항", href: "/support/notice" },
    { label: "FAQ", href: "/support/faq" },
    { label: "고객센터", href: "/support/contact" },
  ];

  return <MenuDropdown items={items} onClose={onClose} />;
}
