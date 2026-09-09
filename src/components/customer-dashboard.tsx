"use client";

import { useEffect, useState } from "react";
import type { AvailabilitySlot, Review } from "@/lib/types";

type DashboardBooking = {
  id: string;
  reference: string;
  status: string;
  paymentStatus?: string;
  programTitle?: string;
  startsAt?: string;
  endsAt?: string;
  accessUrl?: string;
  accessInstructions?: string;
};

function date(value?: string) {
  return value ? new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "Time to be arranged";
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; type: string; status: string; message: string }[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [reviewBooking, setReviewBooking] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("5");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [dashboard, availability] = await Promise.all([fetch("/api/dashboard"), fetch("/api/availability")]);
    const data = await dashboard.json();
    const slotData = await availability.json();
    setBookings(data.bookings || []);
    setReviews(data.reviews || []);
    setNotifications(data.notifications || []);
    setSlots(slotData.availability || []);
  }
  useEffect(() => { load().catch(() => setError("Could not load your dashboard.")); }, []);

  async function updateBooking(input: { bookingId: string; action: "cancel" | "reschedule"; availabilityId?: string }) {
    setError("");
    const response = await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Booking could not be updated."); return; }
    setMessage(input.action === "cancel" ? "Booking cancelled." : "Booking rescheduled.");
    await load();
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: reviewBooking, rating: Number(rating), text: reviewText }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Review could not be submitted."); return; }
    setReviewText("");
    setReviewBooking("");
    setMessage("Review submitted. It will appear after moderation.");
    await load();
  }

  const eligible = bookings.filter((booking) => booking.status === "CONFIRMED" && !reviews.some((review) => review.bookingId === booking.id));
  return <div className="mt-12 space-y-10">
    <section>
      <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Your coaching journey</p><h2 className="mt-2 font-display text-3xl">Sessions, access & history</h2></div><span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-moss">{bookings.length} booking{bookings.length === 1 ? "" : "s"}</span></div>
      {bookings.length === 0 ? <p className="mt-5 rounded-2xl bg-sand p-5 text-sm text-ink/65">Your purchased sessions and booking history will appear here.</p> : <div className="mt-5 space-y-4">{bookings.map((booking) => <article key={booking.id} className="rounded-2xl border border-ink/10 bg-white p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h3 className="font-display text-2xl">{booking.programTitle || "Coaching session"}</h3><p className="mt-1 font-mono text-sm text-moss">{booking.reference}</p></div><span className="h-fit rounded-full bg-mist px-3 py-1 text-xs font-semibold capitalize text-moss">{booking.status.toLowerCase()}</span></div>
        <p className="mt-4 text-sm text-ink/65">{date(booking.startsAt)}{booking.endsAt ? ` – ${date(booking.endsAt)}` : ""} · payment {booking.paymentStatus?.toLowerCase() || "not required"}</p>
        {booking.accessInstructions && <div className="mt-4 rounded-xl bg-sand p-4 text-sm leading-6"><p className="font-semibold">Access details</p><p className="mt-1 text-ink/65">{booking.accessInstructions}</p>{booking.accessUrl && <a href={booking.accessUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold text-moss underline">Open meeting room ↗</a>}</div>}
        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && <div className="mt-4 flex flex-wrap gap-3"><button onClick={() => updateBooking({ bookingId: booking.id, action: "cancel" })} className="text-sm font-semibold text-coral underline underline-offset-4">Cancel booking</button>{booking.status === "CONFIRMED" && <select aria-label={`Reschedule ${booking.reference}`} defaultValue="" onChange={(event) => { if (event.target.value) updateBooking({ bookingId: booking.id, action: "reschedule", availabilityId: event.target.value }); }} className="rounded-lg border border-ink/15 px-3 py-2 text-sm"><option value="">Reschedule…</option>{slots.filter((slot) => slot.isOpen).map((slot) => <option key={slot.id} value={slot.id}>{date(slot.startsAt)}</option>)}</select>}</div>}
      </article>)}</div>}
    </section>
    {eligible.length > 0 && <section className="card"><p className="eyebrow">Share your reflection</p><h2 className="mt-2 font-display text-3xl">How was your session?</h2><form onSubmit={submitReview} className="mt-5 space-y-4"><label className="block text-sm font-semibold">Confirmed booking<select required value={reviewBooking} onChange={(event) => setReviewBooking(event.target.value)} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"><option value="">Choose a booking</option>{eligible.map((booking) => <option key={booking.id} value={booking.id}>{booking.programTitle} · {booking.reference}</option>)}</select></label><label className="block text-sm font-semibold">Rating<select value={rating} onChange={(event) => setRating(event.target.value)} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} out of 5</option>)}</select></label><label className="block text-sm font-semibold">Reflection<textarea required minLength={20} value={reviewText} onChange={(event) => setReviewText(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" placeholder="What would you like to share?" /></label><button className="button-primary">Submit for review</button></form></section>}
    <section><h2 className="font-display text-3xl">Notifications</h2>{notifications.length === 0 ? <p className="mt-4 text-sm text-ink/60">Booking and payment updates will appear here.</p> : <ul className="mt-4 space-y-3">{notifications.slice(0, 8).map((item) => <li key={item.id} className="flex flex-col gap-1 rounded-xl bg-mist px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{item.message}</span><span className="text-xs font-semibold uppercase tracking-wide text-moss">{item.status.toLowerCase()}</span></li>)}</ul>}</section>
    {message && <p role="status" className="rounded-xl bg-mist px-4 py-3 text-sm text-moss">{message}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
  </div>;
}
