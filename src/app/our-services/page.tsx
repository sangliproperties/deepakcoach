import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Durdrushti Solutions",
  description:
    "Explore business coaching, student mindset, life coaching, career counseling, morning rituals, health and personal development.",
};

const services = [
  {
    number: "01",
    icon: "💼",
    title: "Business Coaching",
    description:
      "Build stronger businesses, confident teams, and better decisions.",
    items: ["Sales Growth Blueprint", "Team & Leadership", "Decision Making"],
  },
  {
    number: "02",
    icon: "🎓",
    title: "Advanced Student Mindset",
    description: "Develop focus, confidence, and a success-oriented mindset.",
    items: ["Focus & Concentration", "Exam Success", "Career Guidance"],
  },
  {
    number: "03",
    icon: "🤝",
    title: "1:1 Life Coaching",
    description: "Find clarity and work toward meaningful personal growth.",
    items: ["Clarity", "Emotional Healing", "Relationship Solutions"],
  },
  {
    number: "04",
    icon: "🧭",
    title: "Career Counseling",
    description: "Discover your direction and explore a purposeful career.",
    items: ["From Confusion to Calling & Life Purpose"],
  },
  {
    number: "05",
    icon: "🌅",
    title: "Magical Morning Rituals",
    description:
      "Build positive routines for more focused and mindful mornings.",
    items: ["Goal Setting & Focus", "Positive Habits", "Mindful Living"],
  },
  {
    number: "06",
    icon: "🌿",
    title: "Organic Secrets of Health",
    description:
      "Explore natural habits and lifestyle practices for wellbeing.",
    items: ["Natural Food & Lifestyle", "Stress Reduction", "Healthy Living"],
  },
];

const otherBenefits = [
  "Skill Development",
  "Peak Performance",
  "Leadership Skills",
  "Time Management",
  "Communication Skills",
  "Focus",
  "Relationship Mastery",
  "Financial Literacy",
  "Goal Setting",
  "Creative Thinking",
  "Assertiveness",
  "Mindfulness",
  "Overcome Fear, Stress, Anxiety, Anger & Overthinking",
  "Self Love",
];

const keyBenefits = [
  {
    number: "01",
    title: "Clarity & Purpose",
    description: "Move forward with greater direction.",
  },
  {
    number: "02",
    title: "Mindset Transformation",
    description: "Develop positive thinking patterns.",
  },
  {
    number: "03",
    title: "Better Decisions",
    description: "Make thoughtful and confident choices.",
  },
  {
    number: "04",
    title: "Personal & Business Growth",
    description: "Build progress in life and work.",
  },
];

export default function OurServicesPage() {
  return (
    <div className="min-h-screen bg-[#F8FBF9]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#245D4F] px-5 py-16 text-white sm:py-20">
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#D3E8DB]">
            DURDRUSHTI SOLUTIONS
          </p>

          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl">
            OUR SERVICES
          </h1>

          <div className="mx-auto my-6 h-1 w-20 rounded-full bg-[#B7D6C3]" />

          <p className="mx-auto max-w-2xl text-lg leading-8 text-[#E1F0E8]">
            Empowering Growth. Inspiring Transformation.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#D3E8DB] sm:text-base">
            Discover coaching and development services designed to support your
            personal, professional, and business growth.
          </p>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#245D4F]">
            WHAT WE OFFER
          </p>

          <h2 className="font-display text-3xl font-extrabold text-[#193E34] sm:text-4xl">
            Coaching & Development Services
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#52665C]">
            Explore our six key service areas for meaningful development and
            lasting progress.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.number}
              className="group flex h-full flex-col rounded-3xl border border-[#D9E9DF] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#9FC6AF] hover:shadow-lg"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F3EC] text-3xl">
                  {service.icon}
                </div>

                <span className="font-display text-3xl font-extrabold text-[#C9DED1]">
                  {service.number}
                </span>
              </div>

              <h3 className="font-display text-xl font-extrabold text-[#193E34]">
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#61756A]">
                {service.description}
              </p>

              <div className="my-5 h-px bg-[#E3EEE7]" />

              <ul className="space-y-3">
                {service.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm font-medium leading-6 text-[#304C3E]"
                  >
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F3EC] text-xs font-bold text-[#245D4F]">
                      ✓
                    </span>

                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-7">
                <div className="h-1 w-12 rounded-full bg-[#245D4F] transition-all duration-300 group-hover:w-20" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* OTHER KEY BENEFITS */}
      <section className="bg-[#EDF5EF] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#245D4F]">
              GROW WITH CONFIDENCE
            </p>

            <h2 className="font-display text-3xl font-extrabold text-[#193E34] sm:text-4xl">
              OTHER KEY BENEFITS
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#52665C]">
              Develop practical skills and a stronger mindset for everyday life
              and professional success.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherBenefits.map((benefit, index) => (
              <div
                key={benefit}
                className="flex min-h-[92px] items-center gap-4 rounded-2xl border border-[#D5E7DA] bg-white p-5 transition-colors duration-200 hover:bg-[#F5FAF6]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F1E7] text-sm font-extrabold text-[#245D4F]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="text-sm font-bold leading-6 text-[#245D4F]">
                  {benefit}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY BENEFITS */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#245D4F]">
            YOUR GROWTH MATTERS
          </p>

          <h2 className="font-display text-3xl font-extrabold text-[#193E34] sm:text-4xl">
            Key Benefits
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {keyBenefits.map((benefit) => (
            <div
              key={benefit.number}
              className="rounded-3xl border border-[#D8E8DC] bg-[#F0F7F2] p-7 text-center"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#245D4F] text-sm font-bold text-white">
                {benefit.number}
              </div>

              <h3 className="font-display text-lg font-extrabold text-[#245D4F]">
                {benefit.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#52665C]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL SECTION */}
      <section className="bg-[#245D4F] px-5 py-14 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Start Your Growth Journey
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#E1F0E8]">
            Take the next step toward clarity, confidence, and purposeful
            growth.
          </p>

          <a
            href="/book"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-[#245D4F] transition hover:bg-[#E8F3EC]"
          >
            Book a Session
          </a>
        </div>
      </section>
    </div>
  );
}
