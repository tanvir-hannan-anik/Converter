import Link from "next/link";
import { Image as ImageIcon, Layers, FileEdit, FileText, Minimize2, ArrowRight } from "lucide-react";

const features = [
  {
    href: "/convert",
    icon: ImageIcon,
    title: "Image to PDF",
    description: "Convert JPG & PNG images into a polished PDF — with optional assignment cover page.",
    accent: "blue",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "hover:border-blue-200",
    cta: "text-blue-600",
    ring: "group-hover:ring-blue-100",
  },
  {
    href: "/merge",
    icon: Layers,
    title: "Merge PDFs",
    description: "Drag, reorder, and combine multiple PDF documents into one seamless file.",
    accent: "violet",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "hover:border-violet-200",
    cta: "text-violet-600",
    ring: "group-hover:ring-violet-100",
  },
  {
    href: "/edit",
    icon: FileEdit,
    title: "Edit PDF",
    description: "Reorder or delete individual pages in any existing PDF document.",
    accent: "emerald",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "hover:border-emerald-200",
    cta: "text-emerald-600",
    ring: "group-hover:ring-emerald-100",
  },
  {
    href: "/pdf-to-doc",
    icon: FileText,
    title: "PDF to Word",
    description: "Extract all readable text from a PDF directly into a Microsoft Word .docx file.",
    accent: "amber",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "hover:border-amber-200",
    cta: "text-amber-600",
    ring: "group-hover:ring-amber-100",
  },
  {
    href: "/compress",
    icon: Minimize2,
    title: "Compress PDF",
    description: "Reduce a PDF to a specific file size target by rasterizing pages efficiently.",
    accent: "sky",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    border: "hover:border-sky-200",
    cta: "text-sky-600",
    ring: "group-hover:ring-sky-100",
  },
];

export default function Home() {
  return (
    <div className="page-enter">

      {/* Hero */}
      <section className="text-center py-14 md:py-20 max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          100% private — runs entirely in your browser
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
          All your PDF tools,{" "}
          <span className="gradient-text">in one place.</span>
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Convert, merge, compress, and edit PDFs — fast and privately, right here, no upload required.
        </p>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ href, icon: Icon, title, description, iconBg, iconColor, border, cta, ring }, i) => (
            <Link
              key={href}
              href={href}
              className={`group relative bg-white rounded-2xl border border-slate-200 ${border} p-7 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all duration-200 ring-4 ring-transparent ${ring} page-enter stagger-${Math.min(i + 1, 5)}`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center`}>
                <Icon size={22} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>

              {/* CTA */}
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${cta} group-hover:gap-2.5 transition-all`}>
                Get started
                <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
