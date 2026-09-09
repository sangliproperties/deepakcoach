"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Something needs attention</p>
      <h1 className="mt-3 font-display text-4xl">That did not quite work.</h1>
      <p className="mt-4 text-ink/70">Your information has not been lost. Please try again, or contact us if the issue continues.</p>
      <button onClick={reset} className="button-primary mt-7">Try again</button>
    </div>
  );
}
