import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import HeaderSignOut from "@/components/header-sign-out";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deepak Khot | Life coaching for purposeful action",
  description:
    "A calm, clear coaching practice for people ready to take their next intentional step.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
        >
          Skip to content
        </a>

        <header className="sticky-site-header sticky top-0 z-50 w-full border-b border-ink/10 bg-[#FBFAF6] shadow-sm">
          <div className="mx-auto grid w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 lg:px-6 xl:grid-cols-[max-content_minmax(0,1fr)_max-content] xl:gap-x-5 xl:px-8">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2 lg:gap-3"
              aria-label="Durdrushti Solutions home"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white 2xl:h-16 2xl:w-16">
                <img
                  src="/logo/Durdrushti Solutions Green Gold Logo.png"
                  alt="Deepak Khot Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <span className="flex items-center gap-3">
                {/*   <span className="h-10 w-0.5 shrink-0 rounded-full bg-[#245D4F]" /> */}

                <span className="flex flex-col">
                  <span className="block whitespace-nowrap font-display text-lg font-extrabold tracking-tight text-[#20242A] xl:text-xl 2xl:text-2xl">
                    Durdrushti Solutions
                  </span>

                  <span className="mt-0.5 block text-xs font-medium text-[#64748B]">
                    Business Life coaching
                  </span>
                </span>
              </span>
            </Link>

            <nav
              aria-label="Primary navigation"
              className="premium-header-scroll hidden min-w-0 w-full items-center justify-center gap-1 overflow-x-auto whitespace-nowrap xl:flex"
            >
              {!isAdmin && (
                <>
                  <Link href="/about" className="premium-nav-link">
                    About
                  </Link>
                </>
              )}

              <Link href="/#approach" className="premium-nav-link">
                Approach
              </Link>

              <Link href="/programs" className="premium-nav-link">
                Programs
              </Link>

              <Link href="/sessions" className="premium-nav-link">
                YouTube Sessions
              </Link>

              <Link href="/paid-sessions" className="premium-nav-link">
                Paid Sessions
              </Link>

              <Link href="/#stories" className="premium-nav-link">
                Stories
              </Link>

              <Link href="/our-services" className="premium-nav-link">
                Our Services
              </Link>

              {!isAdmin && (
                <>
                  <Link href="/contact" className="premium-nav-link">
                    Contact
                  </Link>
                </>
              )}
            </nav>

            <div className="flex min-w-0 items-center justify-end gap-2 whitespace-nowrap">
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

                  {user.role === "CUSTOMER" && (
                    <Link
                      href="/account"
                      className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-moss/20 bg-moss/5 px-3 py-2 text-sm font-semibold text-moss transition hover:bg-moss/10 sm:inline-flex"
                    >
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-moss text-xs font-bold text-white"
                        aria-hidden="true"
                      >
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>

                      <span>{user.name || "My Account"}</span>
                    </Link>
                  )}

                  {user.role !== "CUSTOMER" && (
                    <Link
                      href="/account"
                      className="hidden text-sm font-semibold text-moss sm:inline-flex"
                    >
                      Account
                    </Link>
                  )}

                  <Link
                    href="/book"
                    className="button-primary premium-book-button whitespace-nowrap"
                  >
                    Book a session
                  </Link>

                  <HeaderSignOut />
                </>
              ) : (
                <>
                  <Link href="/auth" className="button-secondary">
                    Login
                  </Link>

                  <Link href="/auth?mode=register" className="button-primary">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>

          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex w-full max-w-[1600px] gap-4 overflow-x-auto px-5 pb-3 text-sm font-medium xl:hidden"
          >
            {!isAdmin && (
              <Link href="/about" className="premium-nav-link">
                About
              </Link>
            )}

            <Link href="/#approach" className="premium-nav-link">
              Approach
            </Link>

            <Link href="/programs" className="premium-nav-link">
              Programs
            </Link>

            <Link href="/sessions" className="premium-nav-link">
              Youtube Sessions
            </Link>

            <Link href="/paid-sessions" className="premium-nav-link">
              Paid Sessions
            </Link>

            <Link href="/#stories" className="premium-nav-link">
              Stories
            </Link>

            <Link href="/our-services" className="premium-nav-link">
              Our Services
            </Link>

            {!isAdmin && (
              <Link href="/contact" className="premium-nav-link">
                Contact
              </Link>
            )}
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
              {!isAdmin && (
                <Link href="/about" className="hover:text-moss">
                  About
                </Link>
              )}

              <Link href="/our-services" className="hover:text-moss">
                Our Services
              </Link>

              <Link href="/sessions" className="hover:text-moss">
                YouTube
              </Link>

              {!isAdmin && (
                <Link href="/contact" className="hover:text-moss">
                  Enquire
                </Link>
              )}

              <Link
                href={user ? "/account" : "/auth"}
                className="hover:text-moss"
              >
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
