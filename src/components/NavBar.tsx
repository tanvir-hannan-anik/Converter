"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/convert",    label: "Image → PDF" },
  { href: "/merge",      label: "Merge"        },
  { href: "/compress",   label: "Compress"     },
  { href: "/edit",       label: "Edit"         },
  { href: "/pdf-to-doc", label: "PDF → Word"   },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              active
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
