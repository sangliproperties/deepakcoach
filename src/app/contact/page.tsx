import Link from "next/link";

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
      <form className="card" action="mailto:hello@deepakcoach.example" method="post" encType="text/plain">
        <label className="block text-sm font-semibold" htmlFor="name">Your name</label>
        <input id="name" name="name" required className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3" />
        <label className="mt-5 block text-sm font-semibold" htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" required className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3" />
        <label className="mt-5 block text-sm font-semibold" htmlFor="message">What would you like to explore?</label>
        <textarea id="message" name="message" required rows={6} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3" />
        <button type="submit" className="button-primary mt-6">Prepare enquiry email</button>
        <p className="mt-4 text-xs leading-5 text-ink/55">This MVP uses your email application for enquiries. A provider-backed enquiry inbox can be added without changing the public experience.</p>
      </form>
      <div className="lg:col-span-2 text-center text-sm text-ink/60">Prefer to start directly? <Link href="/book?program=clarity-call" className="font-semibold text-moss underline underline-offset-4">See Clarity Call times</Link></div>
    </div>
  );
}
