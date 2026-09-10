import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { formatInr } from "@/lib/catalog";
import { listPublicPrograms } from "@/lib/demo-store";

export default function ProgramsPage() {
  const programs = listPublicPrograms();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <SectionHeading eyebrow="Programs & sessions" title="Clear options for a meaningful conversation.">
        Take a look at the time, format, inclusions, and expectations. One-to-one booking is available for the clarity call and focused growth session; enquire about the Direction Series.
      </SectionHeading>
      <div className="mt-12 space-y-6">
        {programs.map((program) => (
          <article key={program.id} className="grid gap-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft md:grid-cols-[1fr_0.9fr] md:p-8">
            <div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-mist px-3 py-1 text-moss">{program.format}</span>
                <span className="rounded-full bg-sand px-3 py-1">{formatInr(program.priceInr)}</span>
              </div>
              <h2 className="mt-5 font-display text-3xl">{program.title}</h2>
              <p className="mt-2 font-medium text-moss">{program.tagline}</p>
              <p className="mt-4 max-w-2xl leading-7 text-ink/70">{program.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {program.priceInr === 0 ? <Link href={`/book?program=${program.id}`} className="button-primary">View available times</Link> : program.id === "focused-growth" ? <Link href={`/book?program=${program.id}`} className="button-primary">Book this session</Link> : <Link href="/contact" className="button-secondary">Enquire about fit</Link>}
              </div>
            </div>
            <div className="rounded-2xl bg-sand p-6">
              <dl className="space-y-5 text-sm">
                <div><dt className="font-semibold">Duration</dt><dd className="mt-1 text-ink/65">{program.durationMins} minutes{program.id === "direction-series" ? " per session" : ""}</dd></div>
                <div><dt className="font-semibold">Includes</dt><dd className="mt-1 text-ink/65">{program.inclusions.join(" · ")}</dd></div>
                <div><dt className="font-semibold">Good fit for</dt><dd className="mt-1 text-ink/65">{program.eligibility}</dd></div>
                <div><dt className="font-semibold">Before you book</dt><dd className="mt-1 text-ink/65">{program.expectations}</dd></div>
              </dl>
            </div>
          </article>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-6 text-ink/55">Coaching supports reflection and action. It does not diagnose, treat, or replace professional medical or mental-health care.</p>
    </div>
  );
}
