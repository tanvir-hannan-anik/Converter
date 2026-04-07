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

export default function CoverEditor({ options, onChange }: CoverEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, [e.target.name]: e.target.value });
  };

  const fields = [
    { label: "Semester", name: "semester", placeholder: "e.g., Spring 2026" },
    { label: "Course Title", name: "courseTitle", placeholder: "e.g., Data Structures" },
    { label: "Course Code", name: "courseCode", placeholder: "e.g., CIS 201" },
    { label: "Student Name", name: "studentName", placeholder: "e.g., Jane Doe" },
    { label: "Student ID", name: "studentId", placeholder: "e.g., 20210001" },
    { label: "Teacher Name", name: "teacherName", placeholder: "e.g., Dr. Smith" },
    { label: "Department", name: "department", placeholder: "e.g., Department of CIS" },
    { label: "Batch", name: "batch", placeholder: "e.g., 21st" },
    { label: "Submission Date", name: "submissionDate", placeholder: "DD/MM/YYYY", type: "text" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Cover Page Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            <input 
              type={field.type || "text"}
              name={field.name}
              value={options[field.name as keyof CoverOptions]}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
