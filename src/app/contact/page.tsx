import Link from "next/link";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8 lg:py-16">
      {/* LEFT SIDE */}
      <div>
        <p className="eyebrow">Start a conversation</p>

        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight lg:text-5xl">
          Questions are welcome.
        </h1>

        <p className="mt-6 leading-8 text-ink/70">
          If you are unsure which offering fits, share a little about what you
          are hoping to work through. You can also begin with the free Clarity
          Call when it feels appropriate.
        </p>

        {/* CONTACT DETAILS CARD */}
        <div className="mt-8 min-w-0 rounded-3xl bg-moss p-6 text-white shadow-lg sm:p-7 lg:p-8">
          <h2 className="font-display text-2xl font-extrabold tracking-wide">
            CONTACT US
          </h2>

          <div className="mt-8 space-y-7">
            {/* PHONE */}
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl">
                ☎
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Phone Number
                </p>

                <a
                  href="tel:+919850034468"
                  className="mt-1 block text-base font-semibold text-white hover:underline"
                >
                  +91 98500 34468
                </a>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Our Address
                </p>

                <p className="mt-1 text-sm leading-7 text-white sm:text-base">
                  Near RBL, Rukdi, Tal. Hatkanangle, Dist. Kolhapur
                </p>
              </div>
            </div>

            {/* WEBSITE */}
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
                </svg>
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Website
                </p>

                <a
                  href="https://www.deepakkhot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block break-words text-sm font-semibold text-white hover:underline sm:text-base"
                >
                  www.deepakkhot.com
                </a>
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl">
                ✉
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Email Address
                </p>

                <a
                  href="mailto:deepakkhot9999@gmail.com"
                  className="mt-1 block break-words text-sm font-semibold text-white hover:underline sm:text-base"
                >
                  deepakkhot9999@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* EXISTING CARE NOTE */}
        {/*   <div className="mt-8 rounded-3xl bg-mist p-6 text-sm leading-7">
          <p className="font-semibold text-moss">A note on care</p>

          <p className="mt-2 text-ink/70">
            Coaching is for personal development and goal-oriented reflection.
            If you are in immediate distress or need clinical care, please
            contact an appropriate local professional or emergency service.
          </p>
        </div> */}
      </div>

      {/* RIGHT SIDE - EXISTING CONTACT FORM */}
      <div className="min-w-0 self-start">
        <ContactForm />
      </div>

      {/* BOTTOM BOOKING LINK */}
      <div className="text-center text-sm text-ink/60 lg:col-span-2">
        Prefer to start directly?{" "}
        <Link
          href="/book?program=clarity-call"
          className="font-semibold text-moss underline underline-offset-4"
        >
          See Clarity Call times
        </Link>
      </div>
    </div>
  );
}
