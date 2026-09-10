import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getBooking, sessionUser } from "@/lib/demo-store";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { getStoredProgram } from "@/lib/demo-store";

export default function BookingPage({ params }: { params: { id: string } }) {
  const user = sessionUser(cookies().get(SESSION_COOKIE)?.value);
  const booking = getBooking(params.id);
  if (!user) redirect(`/auth?next=/booking/${params.id}`);
  if (!booking || booking.userId !== user.id) notFound();
  const program = getStoredProgram(booking.programId);
  return <div className="mx-auto max-w-2xl px-5 py-20 lg:px-8"><div className="card"><p className="eyebrow">Booking status</p><h1 className="mt-3 font-display text-4xl">{program?.title}</h1><p className="mt-4 text-ink/70">Reference <span className="font-mono font-semibold text-moss">{booking.reference}</span></p><div className="mt-8 flex items-center gap-3 rounded-2xl bg-mist p-4"><span className="h-3 w-3 rounded-full bg-moss" /><span className="font-semibold capitalize">{booking.status.toLowerCase()}</span><span className="text-sm text-ink/60">· payment {booking.paymentStatus?.toLowerCase() || "not required"}</span></div><p className="mt-6 text-sm leading-6 text-ink/65">We keep the state of your booking explicit. If payment is pending or failed, return to the booking flow to retry without creating a duplicate slot claim.</p><Link href="/book" className="button-primary mt-7">Back to booking</Link></div></div>;
}
