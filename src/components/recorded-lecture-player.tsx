"use client";

import { useState } from "react";

type Lecture = {
  id: string;
  title: string;
  description: string;
  dayNumber: number;
  durationMins: number;
};

type Props = {
  courseId: string;
  lectures: Lecture[];
};

export default function RecordedLecturePlayer({ courseId, lectures }: Props) {
  const [selected, setSelected] = useState(0);

  if (lectures.length === 0) {
    return <p>No lectures available yet.</p>;
  }

  const lecture = lectures[selected];

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <video
          key={lecture.id}
          controls
          controlsList="nodownload"
          preload="metadata"
          src={
            `/api/recorded-sessions/${courseId}` +
            `/lectures/${lecture.id}/stream`
          }
          className="aspect-video w-full rounded-2xl bg-black"
        />

        <h2 className="mt-5 text-2xl font-semibold">
          Day {lecture.dayNumber}: {lecture.title}
        </h2>

        <p className="mt-2 text-ink/65">{lecture.description}</p>
      </div>

      <aside className="space-y-3">
        <h3 className="text-xl font-semibold">Course Lectures</h3>

        {lectures.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(index)}
            className={
              "w-full rounded-xl border p-4 text-left " +
              (selected === index
                ? "border-emerald-700 bg-emerald-50"
                : "border-gray-200 bg-white")
            }
          >
            <strong>
              Day {item.dayNumber}: {item.title}
            </strong>

            <p className="mt-1 text-sm text-gray-500">
              {item.durationMins} minutes
            </p>
          </button>
        ))}
      </aside>
    </div>
  );
}
