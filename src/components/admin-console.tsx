"use client";

import { useEffect, useState } from "react";
import type { AvailabilitySlot, Booking } from "@/lib/types";

function display(value: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function AdminConsole() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [availability, bookingResponse] = await Promise.all([fetch("/api/availability"), fetch("/api/bookings")]);
    const availabilityData = await availability.json();
    const bookingData = await bookingResponse.json();
    setSlots(availabilityData.availability || []);
    setBookings(bookingData.bookings || []);
  }
  useEffect(() => { load().catch(() => setError("Could not load the operations view.")); }, []);

  async function addSlot() {
    setMessage("");
    setError("");
    const response = await fetch("/api/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startsAt, durationMins: 60 }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Slot could not be added."); return; }
    setStartsAt("");
    setMessage("Availability added.");
    await load();
  }

  async function removeSlot(id: string) {
    const response = await fetch(`/api/availability?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) { const data = await response.json(); setError(data.error || "Slot could not be removed."); return; }
    await load();
  }

  return <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Administrator operations</p><h1 className="mt-3 font-display text-5xl">Availability & bookings</h1><p className="mt-4 max-w-2xl leading-7 text-ink/65">Demo operations are protected by the administrator role. In production, availability and booking writes should use the Prisma transaction boundary described in the schema.</p></div><form onSubmit={(event) => { event.preventDefault(); addSlot(); }} className="card w-full sm:max-w-sm"><label htmlFor="startsAt" className="text-sm font-semibold">Add a 60-minute slot</label><input id="startsAt" type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" /><button className="button-primary mt-3 w-full">Add availability</button></form></div>{message && <p role="status" className="mt-6 rounded-xl bg-mist px-4 py-3 text-sm text-moss">{message}</p>}{error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}<section className="mt-12"><h2 className="font-display text-3xl">Upcoming availability</h2><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{slots.map((slot) => <div key={slot.id} className={`rounded-2xl border p-4 ${slot.isOpen ? "border-ink/10 bg-white" : "border-coral/20 bg-sand"}`}><p className="font-semibold">{display(slot.startsAt)}</p><p className="mt-1 text-sm text-ink/55">{slot.isOpen ? "Open for booking" : "Claimed or closed"}</p><button onClick={() => removeSlot(slot.id)} className="mt-4 text-sm font-semibold text-coral underline underline-offset-4">Remove</button></div>)}</div></section><section className="mt-14"><h2 className="font-display text-3xl">Booking states</h2>{bookings.length === 0 ? <p className="mt-5 rounded-2xl bg-sand p-5 text-sm text-ink/65">No bookings yet. A customer booking will appear here with its explicit state.</p> : <div className="mt-5 overflow-x-auto rounded-2xl border border-ink/10 bg-white"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-ink/10 bg-sand"><tr><th className="px-4 py-3 font-semibold">Reference</th><th className="px-4 py-3 font-semibold">Program</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Payment</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id} className="border-b border-ink/5 last:border-0"><td className="px-4 py-3 font-mono">{booking.reference}</td><td className="px-4 py-3">{booking.programId}</td><td className="px-4 py-3 capitalize">{booking.status.toLowerCase()}</td><td className="px-4 py-3 capitalize">{booking.paymentStatus?.toLowerCase() || "not required"}</td></tr>)}</tbody></table></div>}</section></div>;
}
