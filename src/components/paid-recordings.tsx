
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Recording = {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMins: number;
  priceInr: number;
  owned: boolean;
};

export default function PaidRecordings() {
  const router = useRouter();

  const [sessions, setSessions] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/recorded-sessions", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Could not load paid sessions.");
        }

        const data = await response.json();
        setSessions(data.sessions ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load paid sessions."
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function purchase(session: Recording) {
    setError("");
    setBusyId(session.id);

    try {
      const response = await fetch(
        `/api/recorded-sessions/${session.id}/purchase`,
        { method: "POST" }
      );

      if (response.status === 401) {
        router.push(
          `/auth?next=${encodeURIComponent("/paid-sessions")}`
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed.");
      }

      if (data.owned) {
        router.push(`/paid-sessions/${session.slug}`);
        return;
      }

      if (!data.purchaseId) {
        throw new Error("Demo order was not created.");
      }

      const confirmed = window.confirm(
        `DEMO CHECKOUT ONLY\n\n` +
        `Session: ${session.title}\n` +
        `Amount: ₹${data.amountInr}\n\n` +
        `No real money will be charged.\n` +
        `Confirm this test purchase?`
      );

      if (!confirmed) return;

      const confirmation = await fetch(
        "/api/recorded-sessions/demo-confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            purchaseId: data.purchaseId
          })
        }
      );

      const result = await confirmation.json();

      if (!confirmation.ok) {
        throw new Error(
          result.error || "Demo confirmation failed."
        );
      }

      router.push(`/paid-sessions/${session.slug}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not complete demo purchase."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <p className="eyebrow">Learn at your own pace</p>

      <h1 className="mt-3 font-display text-5xl">
        Paid Recorded Sessions
      </h1>

      <p className="mt-4 max-w-2xl text-ink/65">
        Explore recorded coaching sessions and access your
        purchased recordings whenever you need them.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-50 p-4 text-red-800"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-10">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <div className="card mt-10">
          <p>No paid recorded sessions are available yet.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="overflow-hidden rounded-2xl border border-ink/10 bg-white"
            >
              <img
                src={`/api/recorded-sessions/${session.id}/thumbnail`}
                alt={session.title}
                className="aspect-video w-full object-cover"
              />

              <div className="space-y-4 p-5">
                <h2 className="font-display text-2xl">
                  {session.title}
                </h2>

                <p className="text-sm text-ink/65">
                  {session.description}
                </p>

                <div className="flex justify-between text-sm font-semibold">
                  <span>{session.durationMins} minutes</span>
                  <span>₹{session.priceInr.toLocaleString("en-IN")}</span>
                </div>

                {session.owned ? (
                  <Link
                    href={`/paid-sessions/${session.slug}`}
                    className="button-primary inline-flex"
                  >
                    Watch Session
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void purchase(session)}
                    disabled={busyId !== null}
                    className="button-primary"
                  >
                    {busyId === session.id
                      ? "Processing..."
                      : "Get Session"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
