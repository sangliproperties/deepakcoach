import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInr } from "@/lib/catalog";
import { getStoredProgram, listPublicPrograms } from "@/lib/demo-store";

export function generateStaticParams() {
  return listPublicPrograms().map((program) => ({ slug: program.slug }));
}

export default function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const program = getStoredProgram(params.slug);
  if (!program) notFound();
  const bookable = true;
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <Link href="/programs" className="text-sm font-semibold text-moss">← Back to programs</Link>
      <div className="mt-8 rounded-[2rem] bg-sand p-7 sm:p-12">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-mist px-3 py-1 text-moss">{program.format}</span>
          <span className="rounded-full bg-white px-3 py-1">{formatInr(program.priceInr)}</span>
        </div>
        <h1 className="mt-6 font-display text-5xl">{program.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70">{program.description}</p>
        <div className="mt-10 grid gap-6 border-t border-ink/10 pt-8 sm:grid-cols-2">
          <div><h2 className="font-semibold">What is included</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-ink/70">{program.inclusions.map((item) => <li key={item}>✓ {item}</li>)}</ul></div>
          <div><h2 className="font-semibold">What to expect</h2><p className="mt-3 text-sm leading-6 text-ink/70">{program.expectations}</p></div>
        </div>
        {bookable ? <Link href={`/book?program=${program.id}`} className="button-primary mt-10">Choose a time</Link> : <Link href="/contact" className="button-primary mt-10">Enquire about this series</Link>}
      </div>
    </div>
  );
}
