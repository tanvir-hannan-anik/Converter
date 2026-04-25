"use client";
import React from 'react';

export interface CoverOptions {
  semester: string;
  courseTitle: string;
  courseCode: string;
  studentName: string;
  teacherName: string;
  studentId: string;
  department: string;
  batch: string;
  submissionDate: string;
}

interface CoverEditorProps {
  options: CoverOptions;
  onChange: (opts: CoverOptions) => void;
}

const fields = [
  { label: "Semester", name: "semester", placeholder: "e.g., Spring 2026" },
  { label: "Course Title", name: "courseTitle", placeholder: "e.g., Data Structures" },
  { label: "Course Code", name: "courseCode", placeholder: "e.g., CIS 201" },
  { label: "Student Name", name: "studentName", placeholder: "e.g., Jane Doe" },
  { label: "Student ID", name: "studentId", placeholder: "e.g., 20210001" },
  { label: "Teacher Name", name: "teacherName", placeholder: "e.g., Dr. Smith" },
  { label: "Department", name: "department", placeholder: "e.g., Department of CIS" },
  { label: "Batch", name: "batch", placeholder: "e.g., 21st" },
  { label: "Submission Date", name: "submissionDate", placeholder: "DD/MM/YYYY" },
];

export default function CoverEditor({ options, onChange }: CoverEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, [e.target.name]: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            {field.label}
          </label>
          <input
            type="text"
            name={field.name}
            value={options[field.name as keyof CoverOptions]}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-50 placeholder-gray-300 transition-shadow"
            placeholder={field.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
