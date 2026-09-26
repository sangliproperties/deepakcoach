"use client";

import { FormEvent, useEffect, useState } from "react";
import type {
  AvailabilitySlot,
  CancellationPolicy,
  Review,
  Testimonial,
  YouTubeSession,
  Enquiry
} from "@/lib/types";

type AdminBooking = {
  id: string;
  reference: string;

  status:
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "FAILED";

  createdAt: string;
  cancelledAt: string | null;

  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };

  program: {
    id: string;
    title: string;
    priceInr: number;
    durationMins: number;
  };

  availability: {
    id: string;
    startsAt: string;
    endsAt: string;
  };

  payment: {
    id: string;
    amountInr: number;

    status:
    | "CREATED"
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "CANCELLED";

    providerOrderId: string | null;
    providerPaymentId: string | null;
  } | null;
};

type Operations = {
  users: { id: string; name: string; email: string; role: string }[];
  programs: { id: string; title: string; active: boolean }[];
  bookings: AdminBooking[];
  reviews: Review[];
  testimonials: Testimonial[];
  youtubeSessions: YouTubeSession[];
  auditLogs: { id: string; actor: string; action: string; entity: string; entityId?: string; createdAt: string }[];
  enquiries: Enquiry[];
  cancellationPolicy: CancellationPolicy;
};

function display(value: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function displayMeetingDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(new Date(value));
}

function displayBookedOn(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  ).format(new Date(value));
}

export default function AdminConsole() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [operations, setOperations] = useState<Operations | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [section, setSection] = useState("overview");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [youtubeForm, setYoutubeForm] = useState({ title: "", description: "", category: "", duration: "Session", videoId: "" });
  const [storyForm, setStoryForm] = useState({ quote: "", name: "", detail: "" });
  const [programForm, setProgramForm] = useState({ slug: "", title: "", tagline: "", description: "", durationMins: "60", priceInr: "0", format: "Online, one-to-one", inclusions: "", eligibility: "", expectations: "" });

  const [
    bookingStartDate,
    setBookingStartDate
  ] = useState("");

  const [
    bookingEndDate,
    setBookingEndDate
  ] = useState("");

  const [
    bookingPaymentStatus,
    setBookingPaymentStatus
  ] = useState("");


  async function load(
    filters?: {
      startDate?: string;
      endDate?: string;
      paymentStatus?: string;
    }
  ) {
    const params =
      new URLSearchParams();

    if (filters?.startDate) {
      params.set(
        "startDate",
        filters.startDate
      );
    }

    if (filters?.endDate) {
      params.set(
        "endDate",
        filters.endDate
      );
    }

    if (
      filters?.paymentStatus &&
      filters.paymentStatus !==
      "NOT_REQUIRED"
    ) {
      params.set(
        "paymentStatus",
        filters.paymentStatus
      );
    }

    const operationsUrl =
      params.toString()
        ? `/api/admin/operations?${params.toString()}`
        : "/api/admin/operations";

    const [availability, response] =
      await Promise.all([
        fetch("/api/availability"),
        fetch(operationsUrl)
      ]);

    const availabilityData =
      await availability.json();

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Could not load operations."
      );
    }

    let bookings: AdminBooking[] =
      data.bookings || [];

    if (
      filters?.paymentStatus ===
      "NOT_REQUIRED"
    ) {
      bookings =
        bookings.filter(
          (booking) =>
            booking.payment === null
        );
    }

    setSlots(
      availabilityData.availability || []
    );

    setOperations({
      ...data,
      bookings
    });
  }
  useEffect(() => { load().catch(() => setError("Could not load the operations view.")); }, []);

  async function addSlot() {
    setMessage(""); setError("");
    const response = await fetch("/api/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startsAt, durationMins: 60 }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Slot could not be added."); return; }
    setStartsAt(""); setMessage("Availability added."); await load();
  }
  async function removeSlot(id: string) {
    const response = await fetch(`/api/availability?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) { const data = await response.json(); setError(data.error || "Slot could not be removed."); return; }
    await load();
  }
  async function operation(body: Record<string, unknown>) {
    setError(""); setMessage("");
    const response = await fetch("/api/admin/operations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Operation failed."); return; }
    setMessage("Changes saved."); await load();
  }
  async function createContent(body: Record<string, unknown>) {
    setError(""); setMessage("");
    const response = await fetch("/api/admin/operations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Content could not be added."); return false; }
    setMessage("Content added."); await load();
    return true;
  }
  async function deleteYoutubeSession(id: string) {
    setError(""); setMessage("");
    const response = await fetch("/api/admin/operations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentType: "youtube-session", id }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Content could not be deleted."); return; }
    setMessage("Content deleted."); await load();
  }
  async function addProgram(event: FormEvent) {
    event.preventDefault();
    const created = await createContent({ contentType: "program", ...programForm, durationMins: Number(programForm.durationMins), priceInr: Number(programForm.priceInr), inclusions: programForm.inclusions.split("\n").map((item) => item.trim()).filter(Boolean) });
    if (created) setProgramForm({ slug: "", title: "", tagline: "", description: "", durationMins: "60", priceInr: "0", format: "Online, one-to-one", inclusions: "", eligibility: "", expectations: "" });
  }

  if (!operations) return <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8"><p className="card">Loading operations…</p></div>;
  const newEnquiryCount = operations.enquiries.filter(
    (enquiry) => enquiry.status === "NEW"
  ).length;
  const nav = [
    ["overview", "Overview"],
    ["enquiries", `Enquiries${newEnquiryCount > 0 ? ` (${newEnquiryCount} new)` : ""}`],
    ["users", `Users (${operations.users.length})`],
    ["catalog", "Programs"],
    ["content", "Content"],
    ["availability", "Add availability"],
    ["bookings", "Bookings & payments"],
    ["reviews", "Reviews & testimonials"],
    ["audit", "Activity log"],
    ["policy", "Policies"]
  ];
  return <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
    <div><p className="eyebrow">Administrator operations</p><h1 className="mt-3 font-display text-5xl">Run the coaching practice</h1><p className="mt-4 max-w-3xl leading-7 text-ink/65">Operational states are explicit and recoverable in demo mode. Provider-backed deployments can replace these in-memory adapters with Prisma repositories and notification workers.</p></div>
    <div className="mt-8 flex gap-2 overflow-x-auto border-b border-ink/10 pb-3" role="tablist">{nav.map(([id, label]) => <button key={id} onClick={() => setSection(id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${section === id ? "bg-moss text-white" : "bg-sand text-ink/70"}`}>{label}</button>)}</div>
    {message && <p role="status" className="mt-6 rounded-xl bg-mist px-4 py-3 text-sm text-moss">{message}</p>}{error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
    {section === "overview" && <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[
      ["Users", operations.users.length],
      ["Bookings", operations.bookings.length],
      [
        "Payments",
        operations.bookings.filter(
          (booking) =>
            booking.payment !== null
        ).length
      ],
      ["Pending reviews", operations.reviews.filter(
        (review) => review.status === "PENDING"
      ).length],
      ["New enquiries", newEnquiryCount]
    ].map(([label, value]) => <div key={label} className="card"><p className="text-sm text-ink/60">{label}</p><p className="mt-3 font-display text-4xl">{value}</p></div>)}</div>}

    {section === "enquiries" && (
      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">
              Contact enquiries
            </h2>

            <p className="mt-2 text-sm text-ink/60">
              Enquiries submitted from the website contact form.
            </p>
          </div>

          {newEnquiryCount > 0 && (
            <span className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white">
              {newEnquiryCount} new
            </span>
          )}
        </div>

        {operations.enquiries.length === 0 ? (
          <div className="card mt-5">
            <p className="text-sm text-ink/60">
              No contact enquiries yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {operations.enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className={`card ${enquiry.status === "NEW"
                  ? "border-2 border-coral/40"
                  : ""
                  }`}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-2xl">
                        {enquiry.name}
                      </h3>

                      {enquiry.status === "NEW" && (
                        <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold uppercase text-white">
                          New
                        </span>
                      )}
                    </div>

                    <a
                      href={`mailto:${enquiry.email}`}
                      className="mt-2 inline-block text-sm font-semibold text-moss underline underline-offset-4"
                    >
                      {enquiry.email}
                    </a>

                    <p className="mt-2 text-xs text-ink/50">
                      {display(enquiry.createdAt)}
                    </p>
                  </div>

                  {enquiry.status === "NEW" && (
                    <button
                      type="button"
                      onClick={() =>
                        operation({
                          action: "enquiry-read",
                          id: enquiry.id
                        })
                      }
                      className="button-secondary self-start"
                    >
                      Mark as read
                    </button>
                  )}
                </div>

                <div className="mt-5 rounded-2xl bg-sand p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                    What would you like to explore?
                  </p>

                  <p className="mt-3 whitespace-pre-wrap leading-7 text-ink/75">
                    {enquiry.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    )}

    {section === "users" && <section className="mt-10"><h2 className="font-display text-3xl">Users & access</h2><div className="mt-5 overflow-x-auto rounded-2xl border border-ink/10 bg-white"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-ink/10 bg-sand"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Change role</th></tr></thead><tbody>{operations.users.map((user) => <tr key={user.id} className="border-b border-ink/5 last:border-0"><td className="px-4 py-3 font-semibold">{user.name}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3">{user.role}</td><td className="px-4 py-3"><select value={user.role} onChange={(event) => operation({ action: "user-role", id: user.id, role: event.target.value })} className="rounded-lg border border-ink/15 px-2 py-1"><option value="CUSTOMER">Customer</option><option value="COACH">Coach</option><option value="ADMIN">Admin</option></select></td></tr>)}</tbody></table></div></section>}
    {section === "catalog" && <section className="mt-10"><h2 className="font-display text-3xl">Programs & packages</h2><form onSubmit={addProgram} className="card mt-5 grid gap-4 md:grid-cols-2"><input required placeholder="Slug, e.g. leadership-coaching" value={programForm.slug} onChange={(event) => setProgramForm({ ...programForm, slug: event.target.value })} className="rounded-xl border border-ink/15 px-4 py-3" /><input required placeholder="Program title" value={programForm.title} onChange={(event) => setProgramForm({ ...programForm, title: event.target.value })} className="rounded-xl border border-ink/15 px-4 py-3" /><input required placeholder="Tagline" value={programForm.tagline} onChange={(event) => setProgramForm({ ...programForm, tagline: event.target.value })} className="rounded-xl border border-ink/15 px-4 py-3" /><input required type="number" min="15" value={programForm.durationMins} onChange={(event) => setProgramForm({ ...programForm, durationMins: event.target.value })} className="rounded-xl border border-ink/15 px-4 py-3" placeholder="Duration (minutes)" /><input required type="number" min="0" value={programForm.priceInr} onChange={(event) => setProgramForm({ ...programForm, priceInr: event.target.value })} className="rounded-xl border border-ink/15 px-4 py-3" placeholder="Price (INR)" /><input required placeholder="Format" value={programForm.format} onChange={(event) => setProgramForm({ ...programForm, format: event.target.value })} className="rounded-xl border border-ink/15 px-4 py-3" /><textarea required placeholder="Description" value={programForm.description} onChange={(event) => setProgramForm({ ...programForm, description: event.target.value })} className="min-h-24 rounded-xl border border-ink/15 px-4 py-3 md:col-span-2" /><textarea required placeholder="Inclusions, one per line" value={programForm.inclusions} onChange={(event) => setProgramForm({ ...programForm, inclusions: event.target.value })} className="min-h-24 rounded-xl border border-ink/15 px-4 py-3" /><textarea required placeholder="Good fit for" value={programForm.eligibility} onChange={(event) => setProgramForm({ ...programForm, eligibility: event.target.value })} className="min-h-24 rounded-xl border border-ink/15 px-4 py-3" /><textarea required placeholder="What to expect" value={programForm.expectations} onChange={(event) => setProgramForm({ ...programForm, expectations: event.target.value })} className="min-h-24 rounded-xl border border-ink/15 px-4 py-3 md:col-span-2" /><button className="button-primary md:col-span-2">Add program</button></form><div className="mt-5 grid gap-4 md:grid-cols-2">{operations.programs.map((program) => <div key={program.id} className="card flex items-center justify-between gap-4"><div><h3 className="font-display text-2xl">{program.title}</h3><p className="mt-1 text-sm text-ink/60">{program.active ? "Published and bookable" : "Hidden from booking"}</p></div><button onClick={() => operation({ action: "program", id: program.id, active: !program.active })} className="button-secondary">{program.active ? "Deactivate" : "Activate"}</button></div>)}</div></section>}
    {section === "content" && <section className="mt-10 space-y-10">
      <div>
        <h2 className="font-display text-3xl">Add a YouTube session</h2>
        <form onSubmit={(event) => { event.preventDefault(); createContent({ contentType: "youtube-session", ...youtubeForm }); setYoutubeForm({ title: "", description: "", category: "", duration: "Session", videoId: "" }); }} className="card mt-5 grid gap-4 md:grid-cols-2">
          <input required value={youtubeForm.title} onChange={(event) => setYoutubeForm({ ...youtubeForm, title: event.target.value })} placeholder="Session title" className="rounded-xl border border-ink/15 px-4 py-3" />
          <input required value={youtubeForm.category} onChange={(event) => setYoutubeForm({ ...youtubeForm, category: event.target.value })} placeholder="Category" className="rounded-xl border border-ink/15 px-4 py-3" />
          <input required value={youtubeForm.duration} onChange={(event) => setYoutubeForm({ ...youtubeForm, duration: event.target.value })} placeholder="Duration label" className="rounded-xl border border-ink/15 px-4 py-3" />
          <input value={youtubeForm.videoId} onChange={(event) => setYoutubeForm({ ...youtubeForm, videoId: event.target.value })} placeholder="YouTube video ID (optional)" className="rounded-xl border border-ink/15 px-4 py-3" />
          <textarea required value={youtubeForm.description} onChange={(event) => setYoutubeForm({ ...youtubeForm, description: event.target.value })} placeholder="Description" className="min-h-28 rounded-xl border border-ink/15 px-4 py-3 md:col-span-2" />
          <button className="button-primary md:col-span-2">Add YouTube session</button>
        </form>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{operations.youtubeSessions.map((session) => <div key={session.id} className="card"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{session.category}</p><h3 className="mt-2 font-display text-2xl">{session.title}</h3><p className="mt-2 text-sm leading-6 text-ink/65">{session.description}</p><button onClick={() => deleteYoutubeSession(session.id)} className="mt-4 text-sm font-semibold text-coral underline">Delete session</button></div>)}</div>
      </div>
      <div>
        <h2 className="font-display text-3xl">Add a story</h2>
        <form onSubmit={(event) => { event.preventDefault(); createContent({ contentType: "testimonial", ...storyForm }); setStoryForm({ quote: "", name: "", detail: "" }); }} className="card mt-5 grid gap-4 md:grid-cols-2">
          <textarea required value={storyForm.quote} onChange={(event) => setStoryForm({ ...storyForm, quote: event.target.value })} placeholder="Story quote" className="min-h-28 rounded-xl border border-ink/15 px-4 py-3 md:col-span-2" />
          <input required value={storyForm.name} onChange={(event) => setStoryForm({ ...storyForm, name: event.target.value })} placeholder="Name or attribution" className="rounded-xl border border-ink/15 px-4 py-3" />
          <input required value={storyForm.detail} onChange={(event) => setStoryForm({ ...storyForm, detail: event.target.value })} placeholder="Context or detail" className="rounded-xl border border-ink/15 px-4 py-3" />
          <button className="button-primary md:col-span-2">Add story for review</button>
        </form>
      </div>
    </section>}
    {section === "availability" && <section className="mt-10"><div><h2 className="font-display text-3xl">Availability</h2><form onSubmit={(event) => { event.preventDefault(); addSlot(); }} className="card mt-5 max-w-md"><label htmlFor="startsAt" className="text-sm font-semibold">Add a 60-minute slot</label><input id="startsAt" type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" /><button className="button-primary mt-3 w-full">Add availability</button></form><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{slots.map((slot) => <div key={slot.id} className="rounded-2xl border border-ink/10 bg-white p-4"><p className="font-semibold">{display(slot.startsAt)}</p><p className="mt-1 text-sm text-ink/55">{slot.isOpen ? "Open for booking" : "Claimed or closed"}</p><button onClick={() => removeSlot(slot.id)} className="mt-4 text-sm font-semibold text-coral underline">Remove</button></div>)}</div></div></section>}
    {section === "bookings" && (
      <section className="mt-10">
        <div>
          <h2 className="font-display text-3xl">
            Booking & Payment Schedule
          </h2>

          <p className="mt-2 text-sm text-ink/60">
            Customer meetings, booking details
            and payment information.
          </p>
        </div>

        {/* FILTERS */}
        <div className="card mt-5 grid gap-4 md:grid-cols-4">
          <label className="text-sm font-semibold">
            Start Date

            <input
              type="date"
              value={bookingStartDate}
              onChange={(event) =>
                setBookingStartDate(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
            />
          </label>

          <label className="text-sm font-semibold">
            End Date

            <input
              type="date"
              value={bookingEndDate}
              onChange={(event) =>
                setBookingEndDate(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
            />
          </label>

          <label className="text-sm font-semibold">
            Payment Status

            <select
              value={bookingPaymentStatus}
              onChange={(event) =>
                setBookingPaymentStatus(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3"
            >
              <option value="">
                All payments
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="CREATED">
                Created
              </option>

              <option value="FAILED">
                Failed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="NOT_REQUIRED">
                Not required
              </option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              className="button-primary flex-1"
              onClick={() => {
                setError("");

                load({
                  startDate:
                    bookingStartDate,

                  endDate:
                    bookingEndDate,

                  paymentStatus:
                    bookingPaymentStatus
                }).catch(() =>
                  setError(
                    "Could not filter bookings."
                  )
                );
              }}
            >
              Apply
            </button>

            <button
              type="button"
              className="button-secondary flex-1"
              onClick={() => {
                setBookingStartDate("");
                setBookingEndDate("");
                setBookingPaymentStatus("");
                setError("");

                load().catch(() =>
                  setError(
                    "Could not reload bookings."
                  )
                );
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* BOOKING TABLE */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full min-w-[1600px] text-left text-sm">
            <thead className="border-b border-ink/10 bg-sand">
              <tr>
                <th className="px-4 py-3">
                  Meeting Date & Time
                </th>

                <th className="px-4 py-3">
                  Customer
                </th>

                <th className="px-4 py-3">
                  Mobile
                </th>

                <th className="px-4 py-3">
                  Email
                </th>

                <th className="px-4 py-3">
                  Program
                </th>

                <th className="px-4 py-3">
                  Amount
                </th>

                <th className="px-4 py-3">
                  Payment
                </th>

                <th className="px-4 py-3">
                  Booking Status
                </th>

                <th className="px-4 py-3">
                  Booked On
                </th>

                <th className="px-4 py-3">
                  Reference
                </th>

                <th className="px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {operations.bookings.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-10 text-center text-ink/50"
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                operations.bookings.map(
                  (booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-ink/5 align-top last:border-0"
                    >
                      {/* MEETING */}
                      <td className="px-4 py-4 font-semibold">
                        {displayMeetingDate(
                          booking.availability
                            .startsAt
                        )}

                        <p className="mt-1 text-xs font-normal text-ink/50">
                          {
                            booking.program
                              .durationMins
                          }{" "}
                          minutes
                        </p>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-4 py-4 font-semibold">
                        {booking.user.name}
                      </td>

                      {/* MOBILE */}
                      <td className="px-4 py-4">
                        {booking.user.phone ||
                          "Not provided"}
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 py-4">
                        <a
                          href={`mailto:${booking.user.email}`}
                          className="text-moss underline underline-offset-4"
                        >
                          {booking.user.email}
                        </a>
                      </td>

                      {/* PROGRAM */}
                      <td className="px-4 py-4 font-semibold">
                        {booking.program.title}
                      </td>

                      {/* AMOUNT */}
                      <td className="px-4 py-4 font-semibold">
                        ₹
                        {(
                          booking.payment
                            ?.amountInr ??
                          booking.program
                            .priceInr
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      {/* PAYMENT */}
                      <td className="px-4 py-4">
                        {booking.payment ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${booking.payment
                                  .status ===
                                  "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : booking
                                    .payment
                                    .status ===
                                    "FAILED"
                                    ? "bg-red-100 text-red-800"
                                    : booking
                                      .payment
                                      .status ===
                                      "CANCELLED"
                                      ? "bg-gray-100 text-gray-700"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                            >
                              {booking.payment
                                .status ===
                                "PAID"
                                ? "✓ PAID"
                                : booking.payment
                                  .status}
                            </span>

                            <p className="text-xs text-ink/50">
                              DB Payment ID:{" "}
                              {booking.payment.id}
                            </p>

                            <p className="text-xs text-ink/50">
                              Provider Order ID:{" "}
                              {booking.payment
                                .providerOrderId ||
                                "—"}
                            </p>

                            <p className="text-xs text-ink/50">
                              Provider Payment ID:{" "}
                              {booking.payment
                                .providerPaymentId ||
                                "—"}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex rounded-full bg-mist px-3 py-1 text-xs font-semibold text-moss">
                              Not required
                            </span>

                            <p className="mt-1 text-xs text-ink/50">
                              Free program
                            </p>
                          </div>
                        )}
                      </td>

                      {/* BOOKING STATUS */}
                      <td className="px-4 py-4">
                        <span className="font-semibold">
                          {booking.status}
                        </span>
                      </td>

                      {/* BOOKED ON */}
                      <td className="px-4 py-4">
                        {displayBookedOn(
                          booking.createdAt
                        )}
                      </td>

                      {/* REFERENCE */}
                      <td className="px-4 py-4 font-mono text-xs">
                        {booking.reference}
                      </td>

                      {/* ACTION */}
                      <td className="px-4 py-4">
                        {booking.status ===
                          "CANCELLED" ? (
                          <span className="text-ink/50">
                            Closed
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="font-semibold text-coral underline"
                            onClick={async () => {
                              setError("");
                              setMessage("");

                              const response =
                                await fetch(
                                  "/api/bookings",
                                  {
                                    method:
                                      "PATCH",

                                    headers: {
                                      "Content-Type":
                                        "application/json"
                                    },

                                    body:
                                      JSON.stringify(
                                        {
                                          bookingId:
                                            booking.id,

                                          action:
                                            "cancel"
                                        }
                                      )
                                  }
                                );

                              const data =
                                await response.json();

                              if (
                                !response.ok
                              ) {
                                setError(
                                  data.error ||
                                  "Booking could not be cancelled."
                                );

                                return;
                              }

                              setMessage(
                                "Booking cancelled."
                              );

                              await load({
                                startDate:
                                  bookingStartDate,

                                endDate:
                                  bookingEndDate,

                                paymentStatus:
                                  bookingPaymentStatus
                              });
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    )}
    {section === "reviews" && <section className="mt-10 space-y-10"><div><h2 className="font-display text-3xl">Review moderation</h2>{operations.reviews.length === 0 ? <p className="mt-4 text-sm text-ink/60">No customer reviews yet.</p> : <div className="mt-5 space-y-3">{operations.reviews.map((review) => <div key={review.id} className="card"><div className="flex justify-between gap-4"><p className="font-semibold">{review.userName || "Customer"} · {review.rating}/5</p><span className="text-xs font-semibold uppercase text-moss">{review.status}</span></div><p className="mt-3 text-sm leading-6 text-ink/70">{review.text}</p>{review.status === "PENDING" && <div className="mt-4 flex gap-3"><button onClick={() => operation({ action: "review", id: review.id, status: "APPROVED" })} className="button-primary">Approve</button><button onClick={() => operation({ action: "review", id: review.id, status: "REJECTED" })} className="button-secondary">Reject</button></div>}</div>)}</div>}</div><div><h2 className="font-display text-3xl">Testimonials</h2><div className="mt-5 space-y-3">{operations.testimonials.map((testimonial) => <div key={testimonial.id} className="card flex flex-col justify-between gap-4 sm:flex-row"><div><p className="font-display text-xl">“{testimonial.quote}”</p><p className="mt-2 text-sm text-ink/60">{testimonial.name} · {testimonial.detail}</p></div><button onClick={() => operation({ action: "testimonial", id: testimonial.id, status: testimonial.status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED" })} className="button-secondary">{testimonial.status === "PUBLISHED" ? "Archive" : "Publish"}</button></div>)}</div></div></section>}
    {section === "audit" && <section className="mt-10"><h2 className="font-display text-3xl">Administrative activity</h2><div className="mt-5 space-y-3">{operations.auditLogs.length === 0 ? <p className="text-sm text-ink/60">No content activity recorded yet.</p> : operations.auditLogs.map((log) => <div key={log.id} className="card flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between"><p><span className="font-semibold">{log.action}</span> {log.entity.toLowerCase().replace("_", " ")}{log.entityId ? ` (${log.entityId})` : ""}</p><p className="text-ink/55">{log.actor} · {display(log.createdAt)}</p></div>)}</div></section>}
    {section === "policy" && <section className="mt-10 max-w-xl"><h2 className="font-display text-3xl">Cancellation & rescheduling</h2><div className="card mt-5 space-y-5"><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={operations.cancellationPolicy.enabled} onChange={(event) => operation({ action: "policy", enabled: event.target.checked })} /> Allow customer cancellation</label><label className="block text-sm font-semibold">Minimum notice (hours)<input type="number" min="0" max="168" value={operations.cancellationPolicy.minimumHours} onChange={(event) => operation({ action: "policy", minimumHours: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" /></label><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={operations.cancellationPolicy.allowReschedule} onChange={(event) => operation({ action: "policy", allowReschedule: event.target.checked })} /> Allow customer rescheduling</label><label className="block text-sm font-semibold">Reschedule limit<input type="number" min="0" max="5" value={operations.cancellationPolicy.rescheduleLimit} onChange={(event) => operation({ action: "policy", rescheduleLimit: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" /></label><p className="text-sm leading-6 text-ink/60">Policy changes apply to new customer actions immediately. Administrators can always resolve operational bookings.</p></div></section>}
  </div>;
}
