import Link from "next/link";
import { youtubeChannelUrl, youtubeSessions } from "@/lib/media";

export default function SessionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="max-w-3xl">
        <p className="eyebrow">YouTube sessions</p>
        <h1 className="mt-4 font-display text-5xl">Ideas to watch, pause, and practise.</h1>
        <p className="mt-5 text-lg leading-8 text-ink/70">Explore short conversations and guided reflections from Deepak Khot&apos;s coaching practice. Use them as a starting point for your own reflection, then bring the questions that stay with you into a coaching conversation.</p>
        <a href={youtubeChannelUrl} target="_blank" rel="noreferrer" className="button-primary mt-8">Visit YouTube channel ↗</a>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {youtubeSessions.map((session) => (
          <article key={session.title} className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft">
            {session.videoId ? <iframe className="aspect-video w-full" src={`https://www.youtube.com/embed/${session.videoId}`} title={session.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div className="flex aspect-video items-center justify-center bg-moss p-8 text-center text-white"><span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 text-2xl">▶</span></div>}
            <div className="p-6"><div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-moss"><span>{session.category}</span><span>{session.duration}</span></div><h2 className="mt-4 font-display text-2xl">{session.title}</h2><p className="mt-3 leading-7 text-ink/65">{session.description}</p><a href={youtubeChannelUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex font-semibold text-moss underline decoration-moss/30 underline-offset-4">Watch on YouTube ↗</a></div>
          </article>
        ))}
      </div>
      <div className="mt-12 rounded-3xl bg-sand p-6 text-sm leading-7 text-ink/65">Session videos are for education and reflection. They do not replace personalised coaching, medical advice, or mental-health care.</div>
      <div className="mt-12 text-center"><Link href="/book" className="button-secondary">Book a personal conversation</Link></div>
    </div>
  );
}
