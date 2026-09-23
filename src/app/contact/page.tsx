import Link from "next/link";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
      <div>
        <p className="eyebrow">Start a conversation</p>
        <h1 className="mt-4 font-display text-5xl">Questions are welcome.</h1>
        <p className="mt-6 leading-8 text-ink/70">If you are unsure which offering fits, share a little about what you are hoping to work through. You can also begin with the free Clarity Call when it feels appropriate.</p>
        <div className="mt-8 rounded-3xl bg-mist p-6 text-sm leading-7">
          <p className="font-semibold text-moss">A note on care</p>
          <p className="mt-2 text-ink/70">Coaching is for personal development and goal-oriented reflection. If you are in immediate distress or need clinical care, please contact an appropriate local professional or emergency service.</p>
        </div>
      </div>
      <ContactForm />
      <div className="lg:col-span-2 text-center text-sm text-ink/60">Prefer to start directly? <Link href="/book?program=clarity-call" className="font-semibold text-moss underline underline-offset-4">See Clarity Call times</Link></div>
    </div>
  );
}
