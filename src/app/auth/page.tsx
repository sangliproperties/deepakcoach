"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "register" | "recover";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : null;
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const endpoint = mode === "login" ? "/api/auth/login" : mode === "register" ? "/api/auth/register" : "/api/auth/recover";
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Please check the details and try again.");
      return;
    }
    if (mode === "recover") {
      setMessage(data.message);
      return;
    }
    router.push(next || (data.user.role === "ADMIN" ? "/admin" : data.user.role === "COACH" ? "/coach" : "/book"));
    router.refresh();
  }


  
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-5xl gap-10 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
      <div>
        <p className="eyebrow">Your coaching journey</p>
        <h1 className="mt-4 font-display text-5xl">A small account keeps your booking clear.</h1>
        <p className="mt-5 leading-7 text-ink/70">Register to choose a time, keep your booking reference, and receive the right next step. This demo runs in memory; production auth can use the same role boundary with a managed session provider.</p>
        <div className="mt-8 rounded-2xl bg-mist p-5 text-sm leading-6">
          <p className="font-semibold text-moss">Demo access</p>
          <p className="mt-2 text-ink/70">Customer: shripad.sangliproperties@gmail.com / shripad@555</p>
          <p className="text-ink/70">Admin: admin@deepakcoach.local / Admin@123</p>
        </div>
      </div>
      <div className="card">
        <div className="flex gap-2 border-b border-ink/10 pb-4 text-sm">
          {(["login", "register", "recover"] as Mode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setError(""); setMessage(""); }} className={`rounded-full px-4 py-2 font-semibold capitalize ${mode === item ? "bg-moss text-white" : "text-ink/60 hover:bg-mist"}`}>{item === "recover" ? "Recover access" : item}</button>)}
        </div>
        <form onSubmit={submit} className="pt-6">
          {mode === "register" && <><label className="block text-sm font-semibold" htmlFor="name">Full name</label><input id="name" name="name" required minLength={2} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" /></>}
          <label className={`${mode === "register" ? "mt-5" : ""} block text-sm font-semibold`} htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" required className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" />
          {mode !== "recover" && <><label className="mt-5 block text-sm font-semibold" htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={8} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" /></>}
          {mode === "register" && <><label className="mt-5 block text-sm font-semibold" htmlFor="phone">Phone <span className="font-normal text-ink/50">(optional)</span></label><input id="phone" name="phone" type="tel" className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3" /></>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          {message && <p role="status" className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-moss">{message}</p>}
          <button disabled={busy} className="button-primary mt-6 w-full">{busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send recovery guidance"}</button>
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-ink/50">By continuing, you agree to use coaching as a personal-development service and to the booking expectations shown before payment.</p>
      </div>
      <div className="lg:col-span-2 text-center"><Link href="/" className="text-sm font-semibold text-moss">← Return to homepage</Link></div>
    </div>
  );
}
