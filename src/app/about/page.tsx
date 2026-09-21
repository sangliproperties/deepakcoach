import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

const principles = [
  [
    "Listen before leading",
    "Every useful conversation starts by making room for your real experience, not forcing a ready-made answer.",
  ],
  [
    "Make the next step practical",
    "Insight matters most when it becomes a clear action that fits your life, energy, and current priorities.",
  ],
  [
    "Grow with honesty and care",
    "Progress is not perfection. We work with compassion, responsibility, and respect for your own pace.",
  ],
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <p className="eyebrow">About Deepak Khot</p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h1 className="max-w-4xl font-display text-5xl leading-[1.05] sm:text-6xl">
              A grounded space to understand yourself and move forward with
              purpose.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-ink/70">
              Deepak Khot&apos;s coaching practice is built around thoughtful
              questions, practical reflection, and the belief that meaningful
              change begins with an honest conversation.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="rounded-[2rem] bg-moss p-8 text-white sm:p-10">
            <span className="text-7xl font-display text-coral">“</span>
            <p className="mt-4 font-display text-3xl leading-tight">
              Your next step does not need to be perfect. It needs to be yours.
            </p>
            <p className="mt-8 border-t border-white/20 pt-5 text-sm text-white/70">
              Deepak Khot · Life coach and personal development guide
            </p>
          </div>
          <div>
            <p className="eyebrow">The person behind the practice</p>
            <h2 className="mt-4 font-display text-4xl">
              Coaching that respects your context.
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-8 text-ink/70">
              <p>
                Life and work can become crowded with expectations,
                responsibilities, and decisions. Coaching offers a deliberate
                pause: a place to hear your own thinking clearly and identify
                what you can influence next.
              </p>
              <p>
                Deepak&apos;s approach is conversational, structured, and
                action-oriented. Sessions are designed to help you explore a
                meaningful question, recognise patterns, and leave with a
                practical direction you can own.
              </p>
              <p>
                The work is collaborative. You bring your experience and
                willingness to reflect; the coaching process brings attentive
                listening, useful questions, and accountability for the actions
                you choose.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Qualification & Certification"
            title="Professional certification"
          >
            A professional credential supporting Deepak Khot&apos;s commitment
            to thoughtful, responsible, and purposeful coaching.
          </SectionHeading>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white p-3 shadow-soft">
              <Image
                src="/certificates/deepak-khot-certificate.jpg"
                alt="Professional certificate of Deepak Khot"
                width={1400}
                height={1000}
                className="h-auto w-full rounded-[1.5rem] object-contain"
                priority={false}
              />
            </div>

            <div className="lg:pl-6">
              <p className="eyebrow">Professional credential</p>

              <h3 className="mt-4 font-display text-3xl sm:text-4xl">
                Learning backed by professional development.
              </h3>

              <p className="mt-5 text-lg leading-8 text-ink/70">
                This certification represents continued learning and
                professional development in support of Deepak&apos;s coaching
                practice.
              </p>

              <p className="mt-5 leading-7 text-ink/60">
                You can view the certificate here as part of the professional
                background behind the coaching practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Vision and mission"
            title="Personal growth should feel accessible, honest, and actionable."
          >
            The practice exists to create a trusted digital and human coaching
            experience where people can gain clarity, take purposeful action,
            and continue developing with confidence.
          </SectionHeading>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="card bg-mist/60">
              <p className="eyebrow">Vision</p>
              <h3 className="mt-4 font-display text-3xl">
                A more intentional life, one conversation at a time.
              </h3>
              <p className="mt-4 leading-7 text-ink/65">
                To make reflective coaching and personal development easier to
                understand, access, and apply in everyday life.
              </p>
            </div>
            <div className="card bg-sand">
              <p className="eyebrow">Mission</p>
              <h3 className="mt-4 font-display text-3xl">
                Turn clarity into purposeful action.
              </h3>
              <p className="mt-4 leading-7 text-ink/65">
                To offer respectful coaching conversations that help people
                understand what matters, make deliberate choices, and practice
                meaningful change.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="How we work"
          title="Three principles guide every session."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {principles.map(([title, text], index) => (
            <article key={title} className="card">
              <span className="text-sm font-semibold text-coral">
                0{index + 1}
              </span>
              <h3 className="mt-8 font-display text-2xl">{title}</h3>
              <p className="mt-3 leading-7 text-ink/65">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-3xl border border-coral/20 bg-sand p-6 text-sm leading-7 text-ink/65">
          Coaching is a personal-development service. It is not medical,
          psychological, or crisis care. If you need urgent or clinical support,
          please contact an appropriately qualified professional or local
          emergency service.
        </div>
      </section>

      <section className="mx-5 rounded-[2rem] bg-moss text-white lg:mx-auto lg:max-w-6xl">
        <div className="flex flex-col gap-6 px-7 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
              Ready when you are
            </p>
            <h2 className="mt-3 font-display text-4xl">
              Start with one question.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="button-secondary border-white/30 bg-white text-moss hover:bg-sand"
            >
              Book a session
            </Link>
            <Link
              href="/contact"
              className="button-secondary border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              Make an enquiry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
