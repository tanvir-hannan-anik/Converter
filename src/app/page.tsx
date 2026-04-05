import Link from "next/link";
import { Image as ImageIcon, Layers, FileEdit, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 text-center">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Manage PDFs with ease.
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Convert images to PDF, merge multiple documents, or edit an existing PDF. 
          Everything runs securely and instantly in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        <Link href="/convert" className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all text-left">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ImageIcon size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Image to PDF</h2>
          <p className="text-slate-500 mb-6">Convert your JPG or PNG files into a high-quality PDF document instantly.</p>
          <div className="font-semibold text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
            Get Started <ArrowRight size={18} />
          </div>
        </Link>

        <Link href="/merge" className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition-all text-left">
          <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Merge PDFs</h2>
          <p className="text-slate-500 mb-6">Combine multiple PDF documents into a single sequential file.</p>
          <div className="font-semibold text-purple-600 flex items-center gap-2 group-hover:gap-3 transition-all">
            Get Started <ArrowRight size={18} />
          </div>
        </Link>
        
        <Link href="/edit" className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-green-300 transition-all text-left">
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileEdit size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Edit PDF</h2>
          <p className="text-slate-500 mb-6">Rearrange, delete pages, and customize existing PDF documents directly.</p>
          <div className="font-semibold text-green-600 flex items-center gap-2 group-hover:gap-3 transition-all">
            Get Started <ArrowRight size={18} />
          </div>
        </Link>

        <Link href="/pdf-to-doc" className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-yellow-300 transition-all text-left">
          <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">PDF to Word</h2>
          <p className="text-slate-500 mb-6">Extract readable text from a PDF document effortlessly into a Microsoft Word file.</p>
          <div className="font-semibold text-yellow-600 flex items-center gap-2 group-hover:gap-3 transition-all">
            Get Started <ArrowRight size={18} />
          </div>
        </Link>
      </div>
    </div>
  );
}
