import React from 'react';

type Color = 'blue' | 'violet' | 'emerald' | 'amber' | 'sky';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: Color;
}

const bgMap: Record<Color, string> = {
  blue:    'bg-blue-600',
  violet:  'bg-violet-600',
  emerald: 'bg-emerald-600',
  amber:   'bg-amber-500',
  sky:     'bg-sky-600',
};

export default function PageHeader({ icon, title, description, color = 'blue' }: PageHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-11 h-11 ${bgMap[color]} rounded-xl flex items-center justify-center shadow-sm shrink-0 mt-0.5`}>
        <span className="text-white [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
}
