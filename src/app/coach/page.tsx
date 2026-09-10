"use client";

import { useEffect, useState } from "react";

type CoachData = {
  availability: { id: string; startsAt: string; endsAt: string; isOpen: boolean }[];
  bookings: { id: string; reference: string; status: string; createdAt: string }[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function CoachPage() {
  const [data, setData] = useState<CoachData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/coach/operations").then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setData(body);
    }).catch((reason: Error) => setError(reason.message));
  }, []);
  if (error) return <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8"><p className="card text-red-800">{error}</p></div>;
  if (!data) return <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8"><p className="card">Loading coach workspace…</p></div>;
  return <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8"><p className="eyebrow">Coach workspace</p><h1 className="mt-3 font-display text-5xl">Schedule and bookings</h1><div className="mt-10 grid gap-8 lg:grid-cols-2"><section><h2 className="font-display text-3xl">Upcoming availability</h2><div className="mt-4 space-y-3">{data.availability.map((slot) => <div key={slot.id} className="card"><p className="font-semibold">{formatDate(slot.startsAt)}</p><p className="mt-1 text-sm text-ink/60">{slot.isOpen ? "Open for booking" : "Booked or closed"}</p></div>)}</div></section><section><h2 className="font-display text-3xl">Bookings</h2><div className="mt-4 space-y-3">{data.bookings.length === 0 ? <p className="text-sm text-ink/60">No bookings yet.</p> : data.bookings.map((booking) => <div key={booking.id} className="card flex items-center justify-between gap-4"><span className="font-mono">{booking.reference}</span><span className="text-sm capitalize text-ink/60">{booking.status.toLowerCase()}</span></div>)}</div></section></div></div>;
}
