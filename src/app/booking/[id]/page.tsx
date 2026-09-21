import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getBooking, getStoredProgram } from "@/lib/persistence";
import { getCurrentUser } from "@/lib/auth";

export default async function BookingPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth?next=/booking/${params.id}`);
  const resolvedBooking = await getBooking(params.id);
  if (!resolvedBooking || resolvedBooking.userId !== user.id) notFound();
  const program = await getStoredProgram(resolvedBooking.programId);
  return <div className="mx-auto max-w-2xl px-5 py-20 lg:px-8"><div className="card"><p className="eyebrow">Booking status</p><h1 className="mt-3 font-display text-4xl">{program?.title}</h1><p className="mt-4 text-ink/70">Reference <span className="font-mono font-semibold text-moss">{resolvedBooking.reference}</span></p><div className="mt-8 flex items-center gap-3 rounded-2xl bg-mist p-4"><span className="h-3 w-3 rounded-full bg-moss" /><span className="font-semibold capitalize">{resolvedBooking.status.toLowerCase()}</span><span className="text-sm text-ink/60">· payment {resolvedBooking.paymentStatus?.toLowerCase() || "not required"}</span></div><p className="mt-6 text-sm leading-6 text-ink/65">We keep the state of your booking explicit. If payment is pending or failed, return to the booking flow to retry without creating a duplicate slot claim.</p><Link href="/book" className="button-primary mt-7">Back to booking</Link></div></div>;
}
