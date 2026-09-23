import Link from "next/link";
import {
  getLatestYoutubeVideos,
  youtubeChannelUrl,
} from "@/lib/media";

export default async function SessionsPage() {
  const youtubeSessions = await getLatestYoutubeVideos(12);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="max-w-3xl">
        <p className="eyebrow">YouTube sessions</p>

        <h1 className="mt-4 font-display text-5xl">
          Ideas to watch, pause, and practise.
        </h1>

        <p className="mt-5 text-lg leading-8 text-ink/70">
          Explore short conversations and guided reflections from Deepak
          Khot&apos;s coaching practice. Use them as a starting point for
          your own reflection, then bring the questions that stay with you
          into a coaching conversation.
        </p>

        <a
          href={youtubeChannelUrl}
          target="_blank"
          rel="noreferrer"
          className="button-primary mt-8"
        >
          Visit YouTube channel ↗
        </a>
      </div>

      {youtubeSessions.length === 0 && (
        <div className="mt-14 rounded-3xl bg-sand p-8 text-center">
          <h2 className="font-display text-2xl">
            YouTube sessions are temporarily unavailable.
          </h2>

          <p className="mt-3 text-sm text-ink/60">
            You can still visit the YouTube channel to watch the latest
            sessions.
          </p>

          <a
            href={youtubeChannelUrl}
            target="_blank"
            rel="noreferrer"
            className="button-primary mt-6"
          >
            Visit YouTube channel ↗
          </a>
        </div>
      )}

      {youtubeSessions.length > 0 && (
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {youtubeSessions.map((video) => (
            <article
              key={video.videoId}
              className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft"
            >
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                  YouTube Session
                </p>

                <h2 className="mt-4 font-display text-2xl">
                  {video.title}
                </h2>

                {video.description && (
                  <p className="mt-3 line-clamp-3 leading-7 text-ink/65">
                    {video.description}
                  </p>
                )}

                {video.publishedAt && (
                  <p className="mt-4 text-xs text-ink/50">
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(video.publishedAt))}
                  </p>
                )}

                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex font-semibold text-moss underline decoration-moss/30 underline-offset-4"
                >
                  Watch on YouTube ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-3xl bg-sand p-6 text-sm leading-7 text-ink/65">
        Session videos are for education and reflection. They do not replace
        personalised coaching, medical advice, or mental-health care.
      </div>

      <div className="mt-12 text-center">
        <Link href="/book" className="button-secondary">
          Book a personal conversation
        </Link>
      </div>
    </div>
  );
}