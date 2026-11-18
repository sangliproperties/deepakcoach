"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatInr } from "@/lib/catalog";
import type { AvailabilitySlot, Program } from "@/lib/types";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";

type BookingResponse = {
  booking?: {
    id: string;
    reference: string;
    status: string;
    paymentStatus?: string;
  };
  error?: string;
  payment?: {
    orderId: string;
    amountInr: number;
    keyId: string;
  };
};

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function BookPage() {
  const searchParams = useSearchParams();
  const [programId, setProgramId] = useState(
    searchParams.get("program") || "clarity-call",
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [booking, setBooking] = useState<BookingResponse["booking"]>();
  const [paymentOrder, setPaymentOrder] =
    useState<BookingResponse["payment"]>();
  const program = useMemo(
    () => programs.find((item) => item.id === programId) || programs[0],
    [programId, programs],
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/availability").then((response) => response.json()),
      fetch("/api/programs").then((response) => response.json()),
    ])
      .then(([availability, catalog]) => {
        setSlots(availability.availability || []);
        setPrograms(catalog.programs || []);
      })
      .catch(() =>
        setError("Booking options could not be loaded. Please refresh."),
      );
  }, []);

  async function reserve() {
    if (busy || booking || !selectedSlot) return;

    setBusy(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programId,
          availabilityId: selectedSlot,
        }),
      });

      const data: BookingResponse = await response.json();

      if (response.status === 401) {
        window.location.href = `/auth?next=${encodeURIComponent(`/book?program=${programId}`)}`;
        return;
      }

      if (!response.ok) {
        if (data.error === "SLOT_ALREADY_BOOKED" || response.status === 409) {
          setError(
            "This slot is unavailable. Please select another available time.",
          );

          setSlots((current) =>
            current.map((slot) =>
              slot.id === selectedSlot
                ? { ...slot, isOpen: false, hasBooking: true }
                : slot,
            ),
          );

          setSelectedSlot("");
          return;
        }

        setError(data.error || "We could not create your booking.");
        return;
      }

      if (!data.booking) {
        setError("The server did not return booking details.");
        return;
      }

      setBooking(data.booking);
      setPaymentOrder(data.payment);

      if (data.booking.status === "CONFIRMED") {
        setStatus("confirmed");
        return;
      }

      if (
        data.payment?.orderId &&
        data.payment?.keyId &&
        data.payment.amountInr > 0
      ) {
        await payRazorpay(data.booking, data.payment);
        return;
      }

      setError(
        "Your booking was created, but no valid payment order was returned. Please contact support before making another booking.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the booking service.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function payRazorpay(
    currentBooking = booking,
    currentPaymentOrder = paymentOrder,
  ) {
    if (!currentBooking || !currentPaymentOrder) {
      setError("Payment order is unavailable.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await openRazorpayCheckout({
        keyId: currentPaymentOrder.keyId,
        orderId: currentPaymentOrder.orderId,
        amountInr: currentPaymentOrder.amountInr,
        name: "DeepakCoach",
        description: `Booking ${currentBooking.reference}`,
      });

      if (!result) {
        setStatus("checking-payment");

        try {
          const releaseResponse = await fetch("/api/bookings/release-hold", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId: currentBooking.id,
            }),
          });

          const releaseData = await releaseResponse.json();

          if (!releaseResponse.ok) {
            throw new Error(
              releaseData.error || "Unable to check the payment status.",
            );
          }

          if (releaseData.released === true) {
            setBooking(undefined);
            setPaymentOrder(undefined);
            setSelectedSlot("");
            setStatus("");

            const availabilityResponse = await fetch("/api/availability", {
              cache: "no-store",
            });

            if (availabilityResponse.ok) {
              const availabilityData = await availabilityResponse.json();

              setSlots(availabilityData.availability || []);
            }

            setError(
              "Payment was not completed. Your temporary slot reservation has been released.",
            );
          } else {
            setStatus("");

            setError(
              "Your payment status is still being checked. " +
                "The slot will remain temporarily reserved until verification finishes.",
            );
          }
        } catch (error) {
          setStatus("");

          setError(
            error instanceof Error
              ? error.message
              : "Payment verification is temporarily unavailable.",
          );
        }

        return;
      }

      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: currentBooking.id,
          paymentId: result.razorpay_payment_id,
          signature: result.razorpay_signature,
        }),
      });

      const data: BookingResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Payment verification is pending. Please contact support before attempting another payment.",
        );
      }

      if (!data.booking || data.booking.status !== "CONFIRMED") {
        throw new Error(
          "Payment verification did not return a confirmed booking. Please check the payment status before retrying.",
        );
      }

      setBooking(data.booking);
      setPaymentOrder(undefined);
      setStatus("confirmed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment confirmation failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!program)
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <p className="card">Loading programs…</p>
      </div>
    );
  if (status === "confirmed" && booking) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <div className="rounded-[2rem] bg-mist p-8 text-center sm:p-14">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss text-2xl text-white">
            ✓
          </span>
          <p className="eyebrow mt-7">Booking confirmed</p>
          <h1 className="mt-3 font-display text-4xl">
            Your next step is on the calendar.
          </h1>
          <p className="mt-4 text-ink/70">
            Keep this reference for your records:
          </p>
          <p className="mt-3 font-mono text-xl font-semibold text-moss">
            {booking.reference}
          </p>
          <p className="mt-6 text-sm leading-6 text-ink/60">
            In a configured environment, meeting details and a confirmation
            notification are sent after the booking is confirmed.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="button-primary">
              Return home
            </Link>
            <Link href="/book" className="button-secondary">
              Book another session
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <div className="max-w-2xl">
        <p className="eyebrow">Book a conversation</p>
        <h1 className="mt-4 font-display text-5xl">
          Choose a time that gives you room to think.
        </h1>
        <p className="mt-5 leading-7 text-ink/70">
          You will need an account before reserving a slot. Free bookings
          confirm immediately; paid bookings remain pending until payment is
          verified server-side.
        </p>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="card h-fit">
          <label className="block text-sm font-semibold" htmlFor="program">
            Offering
          </label>
          <select
            id="program"
            disabled={busy || Boolean(booking)}
            value={programId}
            onChange={(event) => {
              setProgramId(event.target.value);
              setBooking(undefined);
              setPaymentOrder(undefined);
              setSelectedSlot("");
              setStatus("");
              setError("");
            }}
            className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
          >
            {programs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {formatInr(item.priceInr)}
              </option>
            ))}
          </select>
          <div className="mt-6 rounded-2xl bg-sand p-5">
            <p className="font-display text-2xl">{program.title}</p>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              {program.tagline}
            </p>
            <p className="mt-4 text-sm font-semibold">
              {program.durationMins} minutes · {formatInr(program.priceInr)}
            </p>
          </div>
          <p className="mt-5 text-xs leading-5 text-ink/55">
            Your selected slot is held when the server accepts the booking
            request. A slot cannot be claimed twice.
          </p>
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Available times</h2>

            <span className="text-sm text-ink/55">
              {slots.filter((slot) => slot.isOpen && !slot.hasBooking).length}{" "}
              open
            </span>
          </div>

          {slots.length === 0 ? (
            <div className="card text-center text-ink/65">
              No times are currently available. Please enquire and we will help
              you find a suitable option.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {slots.map((slot) => {
                const booked = slot.hasBooking === true;

                const selected = selectedSlot === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={booked}
                    onClick={() => {
                      if (!booked) {
                        setSelectedSlot(slot.id);
                      }
                    }}
                    className={
                      booked
                        ? "cursor-not-allowed rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-left text-red-700"
                        : selected
                          ? "rounded-2xl border border-moss bg-mist p-4 text-left ring-2 ring-moss/20 transition"
                          : "rounded-2xl border border-ink/10 bg-white p-4 text-left transition hover:border-moss/50"
                    }
                  >
                    <span className="block text-sm font-semibold">
                      {displayDate(slot.startsAt)}
                    </span>

                    <span
                      className={
                        booked
                          ? "mt-1 block text-xs text-red-600"
                          : "mt-1 block text-xs text-ink/55"
                      }
                    >
                      Until{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(slot.endsAt))}
                    </span>

                    {booked ? (
                      <span className="mt-3 block text-sm font-bold text-red-600">
                        Slot was already Booked..!!
                      </span>
                    ) : (
                      <span className="mt-3 block text-xs font-semibold text-moss">
                        Available for booking
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          {selectedSlot && !booking && (
            <div className="mt-7 rounded-2xl border border-moss/20 bg-white p-5">
              <p className="text-sm text-ink/65">Selected time</p>

              <p className="mt-1 font-semibold">
                {displayDate(
                  slots.find((slot) => slot.id === selectedSlot)?.startsAt ||
                    "",
                )}
              </p>

              <button
                onClick={reserve}
                disabled={busy}
                className="button-primary mt-5 w-full"
              >
                {busy
                  ? "Reserving…"
                  : program.priceInr === 0
                    ? "Confirm free booking"
                    : `Continue to payment · ${formatInr(program.priceInr)}`}
              </button>
            </div>
          )}

          {booking && paymentOrder && !status && (
            <div className="mt-7 rounded-2xl border border-coral/30 bg-sand p-5">
              <p className="font-semibold">Payment pending</p>

              <p className="mt-2 text-sm leading-6 text-ink/65">
                Your booking reference is <strong>{booking.reference}</strong>.
                Complete your payment securely through Razorpay to confirm this
                booking.
              </p>

              <p className="mt-3 text-lg font-semibold">
                Amount: {formatInr(paymentOrder.amountInr)}
              </p>

              <button
                type="button"
                onClick={() => void payRazorpay()}
                disabled={busy}
                className="button-primary mt-5 w-full"
              >
                {busy ? "Processing payment..." : "Pay securely with Razorpay"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
