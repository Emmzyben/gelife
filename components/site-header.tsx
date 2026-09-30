"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { navigation } from "@/components/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);

  // <details> stays open across client-side navigation, so close it whenever the route changes.
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#421181]/10 bg-white/95 backdrop-blur-lg">
      <div className="site-shell flex h-[84px] items-center justify-between gap-5">
        <Link href="/" aria-label="GELife Group home" className="shrink-0">
          <Image src="/images/logo.png" alt="GELife Group" width={126} height={100} priority className="h-[64px] w-auto" />
        </Link>
        <nav className="hidden items-center gap-5 text-[.92rem] font-semibold text-[#514a5b] lg:flex" aria-label="Primary navigation">
          {navigation.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-[#421181]">{label}</Link>
          ))}
          <Link href="/training/login" className="font-bold text-[#421181] hover:text-[#f47c35]">Learner login</Link>
          <Link href="/contact" className="button-primary !min-h-11 !px-4 !py-2.5">Request a consultation</Link>
        </nav>
        <details ref={menu} className="group relative lg:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-[#d7c9e8] text-[#421181]" aria-label="Open navigation">
            <Menu size={22} />
          </summary>
          <nav className="absolute right-0 top-14 w-[min(88vw,330px)] rounded-2xl border border-[#e8e1ed] bg-white p-3 shadow-2xl" aria-label="Mobile navigation">
            {navigation.map(([label, href]) => (
              <Link key={href} href={href} className="block rounded-xl px-4 py-3 font-semibold text-[#514a5b] hover:bg-[#f7f1fd]">{label}</Link>
            ))}
            <div className="my-2 h-px bg-[#e8e1ed]" />
            <Link href="/training/login" className="block rounded-xl px-4 py-3 font-bold text-[#421181] hover:bg-[#f7f1fd]">Learner login</Link>
            <Link href="/contact" className="button-primary mt-2 w-full">Request a consultation</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
