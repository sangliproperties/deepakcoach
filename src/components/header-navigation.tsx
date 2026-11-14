"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Approach", href: "/#approach" },
  { label: "Programs", href: "/programs" },
  { label: "YouTube Sessions", href: "/sessions" },
  { label: "Paid Sessions", href: "/paid-sessions" },
  { label: "Stories", href: "/stories" },
  { label: "Our Services", href: "/our-services" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

export function HeaderNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex items-center gap-1">
      {navigation.map((item) => {
        const isActive =
          item.href !== "/#approach" &&
          (pathname === item.href || pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className="premium-nav-link"
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
