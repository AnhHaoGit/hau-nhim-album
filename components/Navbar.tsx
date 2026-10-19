"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Xem album" },
  { href: "/edit", label: "Chỉnh sửa" },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 md:px-10">
      <Link
        href="/"
        className="font-script text-3xl md:text-4xl"
        style={{ color: "var(--ink)" }}
      >
        haunhim’s album
      </Link>
      <nav className="flex gap-2 rounded-full bg-white/50 p-1 backdrop-blur">
        {links.map((l) => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-1.5 text-sm font-semibold transition"
              style={{
                background: active ? "var(--ink)" : "transparent",
                color: active ? "#fff" : "var(--ink)",
              }}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
