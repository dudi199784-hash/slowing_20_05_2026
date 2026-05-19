"use client";

import { useEffect, useState } from "react";

export default function Slogan() {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.02 },
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      className={`flex min-h-[min(50dvh,520px)] w-full max-w-[100vw] flex-col items-center justify-center px-6 py-16 text-center transition-colors duration-700 md:py-24 ${
        isFooterVisible ? "bg-black text-white" : "bg-white text-neutral-900"
      }`}
      aria-label="슬로건"
    >
      <h2 className="text-lg font-medium tracking-wide md:text-xl">슬로건</h2>
      <p
        className={`mt-3 max-w-2xl text-sm leading-relaxed md:text-base ${
          isFooterVisible ? "text-white/70" : "text-neutral-600"
        }`}
      >
        회원 가입하시고 SLOWIND의 새로운 소식을 받아보세요
      </p>
      <p
        className={`mt-2 max-w-2xl text-sm leading-relaxed md:text-base ${
          isFooterVisible ? "text-white/70" : "text-neutral-600"
        }`}
      >
        컬렉션 출시, 맞춤화된 커뮤니케이션, 하우스의 최신 소식에 대한 이야기를 가장 먼저
        만나보세요.
      </p>
    </section>
  );
}
