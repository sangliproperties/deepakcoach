"use client";

import { useRouter } from "next/navigation";

export default function AccountActions() {
  const router = useRouter();
  return <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }} className="mt-8 text-sm font-semibold text-coral underline underline-offset-4">Sign out</button>;
}
