import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deepak Khot | Life coaching for purposeful action",
  description:
    "A calm, clear coaching practice for people ready to take their next intentional step.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <header className="border-b border-ink/10 bg-[#fbfaf6]/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="Deepak Khot home"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-moss font-display text-xl text-white">
                D
              </span>
              <span>
                <span className="block font-display text-lg font-semibold">
                  Deepak Khot
                </span>
                <span className="block text-xs text-ink/60">
                  Life coaching & personal development
                </span>
              </span>
            </Link>
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-6 text-sm font-medium md:flex"
            >
              <Link href="/who-is-deepak-khot" className="hover:text-moss">
                Who is Deepak Khot ?
              </Link>
              <Link href="/#approach" className="hover:text-moss">
                Approach
              </Link>
              <Link href="/programs" className="hover:text-moss">
                Programs
              </Link>
              <Link href="/sessions" className="hover:text-moss">
                Sessions
              </Link>
              <Link href="/#stories" className="hover:text-moss">
                Stories
              </Link>
              <Link href="/contact" className="hover:text-moss">
                Contact
              </Link>
              <Link href="/about" className="hover:text-moss">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="button-secondary hidden sm:inline-flex"
                    >
                      Admin
                    </Link>
                  )}
                  {user.role === "COACH" && (
                    <Link
                      href="/coach"
                      className="button-secondary hidden sm:inline-flex"
                    >
                      Coach
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="hidden text-sm font-semibold text-moss sm:inline-flex"
                  >
                    Account
                  </Link>
                  <div className="flex flex-col items-center">
                    <Link
                      href="/book"
                      className="button-primary whitespace-nowrap"
                    >
                      Book a session
                    </Link>

                    <span className="mt-1 whitespace-nowrap text-[10px] font-semibold tracking-wide text-moss/70">
                      20 min Complimentary / Trial Session
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/book?program=clarity-call"
                    className="button-primary"
                  >
                    Book free trial
                  </Link>
                  <Link href="/auth" className="button-secondary">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-5 pb-3 text-sm font-medium md:hidden"
          >
            <Link href="/who-is-deepak-khot" className="whitespace-nowrap">
              Who is Deepak Khot ?
            </Link>
            <Link href="/#approach" className="whitespace-nowrap">
              Approach
            </Link>
            <Link href="/programs" className="whitespace-nowrap">
              Programs
            </Link>
            <Link href="/sessions" className="whitespace-nowrap">
              Sessions
            </Link>
            <Link href="/#stories" className="whitespace-nowrap">
              Stories
            </Link>
            <Link href="/contact" className="whitespace-nowrap">
              Contact
            </Link>
            <Link href="/about" className="whitespace-nowrap">
              About
            </Link>
          </nav>
        </header>
        <main id="main-content">{children}</main>
        <footer className="mt-20 border-t border-ink/10 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10 text-sm text-ink/65 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                Make space for your next step.
              </p>
              <p className="mt-1">
                Coaching conversations grounded in clarity, choice, and
                compassionate action.
              </p>
            </div>
            <div className="flex gap-5">
            {/*   <Link href="/about" className="hover:text-moss">
                About
              </Link> */}
              <Link href="/sessions" className="hover:text-moss">
                YouTube
              </Link>
              <Link href="/contact" className="hover:text-moss">
                Enquire
              </Link>
              <Link href="/auth" className="hover:text-moss">
                {user ? "Account" : "Sign in"}
              </Link>
              <span>© {new Date().getFullYear()} Deepak Khot</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
