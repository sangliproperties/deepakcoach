import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { formatInr } from "@/lib/catalog";
import { listPublicPrograms, listTestimonials, listYoutubeSessions } from "@/lib/demo-store";

export default function HomePage() {
  const testimonials = listTestimonials("PUBLISHED");
  const youtubeSessions = listYoutubeSessions();
  const programs = listPublicPrograms();
  return (
    <>
      <section className="overflow-hidden bg-sand">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">A thoughtful place to begin</p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] text-ink sm:text-6xl">Clarity for the life you are choosing.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/70">I&apos;m Deepak Khot. I create grounded coaching conversations that help you understand what matters, make deliberate choices, and take your next purposeful step.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/programs" className="button-primary">Explore programs</Link>
              <Link href="/contact" className="button-secondary">Start with an enquiry</Link>
            </div>
            <p className="mt-5 text-sm text-ink/55">No promises of overnight transformation. Just an honest, human space to think and act.</p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[3rem] border border-coral/25" />
            <div className="relative rounded-[2.5rem] bg-moss p-8 text-white shadow-soft sm:p-10">
              <span className="text-6xl font-display text-coral">“</span>
              <p className="mt-5 font-display text-3xl leading-tight">A meaningful change often starts with a more honest question.</p>
              <div className="mt-10 border-t border-white/20 pt-5 text-sm text-white/70">Deepak Khot · Life coach</div>
            </div>
          </div>
        </div>
      </section>

      <section id="approach" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="The coaching approach" title="A pause. A perspective. A practical next step." >
          Coaching is not advice handed down from a distance. It is a structured conversation where you can notice patterns, name choices, and decide what you want to practice next.
        </SectionHeading>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["01", "Listen inward", "Make room for the thoughts, emotions, and values that deserve your attention."],
            ["02", "Choose deliberately", "Separate what is yours to influence from the noise and pressure around you."],
            ["03", "Move with intention", "Translate insight into a small, realistic action you can own."]
          ].map(([number, title, text]) => (
            <div key={number} className="card bg-mist/60">
              <span className="text-sm font-semibold text-coral">{number}</span>
              <h3 className="mt-8 font-display text-2xl">{title}</h3>
              <p className="mt-3 leading-7 text-ink/65">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <SectionHeading eyebrow="Programs" title="Choose the pace that feels right." >
            Each offering makes the format, time, price, and expectations clear before you book. Start small, or enquire about a deeper series.
          </SectionHeading>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {programs.map((program) => (
              <article key={program.id} className="flex flex-col rounded-3xl border border-ink/10 p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-moss">{program.durationMins} min</span>
                  <span className="text-sm font-semibold">{formatInr(program.priceInr)}</span>
                </div>
                <h3 className="mt-7 font-display text-2xl">{program.title}</h3>
                <p className="mt-2 text-sm font-medium text-moss">{program.tagline}</p>
                <p className="mt-4 flex-1 leading-7 text-ink/65">{program.description}</p>
                <Link href={program.priceInr === 0 ? `/book?program=${program.id}` : `/programs/${program.slug}`} className="button-secondary mt-7">
                  {program.priceInr === 0 ? "See available times" : "View details"}
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-7 text-center"><Link href="/programs" className="font-semibold text-moss underline decoration-moss/30 underline-offset-4">Compare all offering details →</Link></div>
        </div>
      </section>

      <section id="stories" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Words from participants" title="A space that lets people be human." >
          These are representative reflections shared with permission. Every person&apos;s experience is different, and coaching is not a substitute for medical or mental-health care.
        </SectionHeading>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="rounded-3xl bg-sand p-6">
              <blockquote className="font-display text-xl leading-8">“{testimonial.quote}”</blockquote>
              <figcaption className="mt-8 text-sm"><strong className="block">{testimonial.name}</strong><span className="text-ink/55">{testimonial.detail}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <SectionHeading eyebrow="Watch and reflect" title="Coaching ideas for your own time.">
            Explore selected YouTube sessions about clarity, personal growth, and purposeful action. Start with a few minutes of reflection, then decide what deserves a deeper conversation.
          </SectionHeading>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {youtubeSessions.map((session) => <article key={session.id} className="rounded-3xl border border-ink/10 p-6"><div className="flex h-32 items-center justify-center rounded-2xl bg-moss text-3xl text-white">▶</div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-moss">{session.category}</p><h3 className="mt-3 font-display text-2xl">{session.title}</h3><p className="mt-3 text-sm leading-6 text-ink/65">{session.description}</p></article>)}
          </div>
          <div className="mt-8 text-center"><Link href="/sessions" className="button-secondary">Explore all YouTube sessions</Link></div>
        </div>
      </section>

      <section className="mx-5 overflow-hidden rounded-[2rem] bg-moss text-white lg:mx-auto lg:max-w-6xl">
        <div className="grid gap-8 px-7 py-12 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Your next chapter can begin gently</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl">You do not have to have it all figured out to start.</h2>
          </div>
          <Link href="/auth" className="button-secondary border-white/30 bg-white text-moss hover:bg-sand">Take the first step</Link>
        </div>
      </section>
    </>
  );
}
