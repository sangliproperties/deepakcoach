import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AccountActions from "@/components/account-actions";
import CustomerDashboard from "@/components/customer-dashboard";

export default function AccountPage() {
  const user = getCurrentUser();
  if (!user) redirect("/auth");
  return <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8"><div className="card"><p className="eyebrow">Your account</p><h1 className="mt-3 font-display text-4xl">{user.name}</h1><p className="mt-3 text-ink/65">{user.email}</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><a href="/book" className="button-primary">Book a session</a>{user.role === "ADMIN" && <a href="/admin" className="button-secondary">Open admin console</a>}{user.role === "COACH" && <a href="/coach" className="button-secondary">Open coach schedule</a>}</div><AccountActions /><CustomerDashboard /></div></div>;
}
