import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

export const metadata = {
  title: "Who is Deepak Khot? | Holistic Mindset & Life Coach",
  description:
    "Learn about Deepak Khot, a Holistic Mindset & Life Coach, Career Counselor, NLP Trainer, Trainer, and Author focused on mindset transformation, life skills, career clarity, emotional mastery, and purposeful living."
};

const lifeSkills = [
  {
    title: "Self-Awareness",
    text: "Understand your thoughts, emotions, strengths, weaknesses, values, and identity."
  },
  {
    title: "Emotional Intelligence",
    text: "Recognize and manage emotions such as stress, fear, anger, anxiety, and self-doubt."
  },
  {
    title: "Communication",
    text: "Express yourself clearly, listen deeply, speak confidently, and understand others."
  },
  {
    title: "Decision-Making",
    text: "Make thoughtful choices instead of reacting impulsively to pressure or circumstances."
  },
  {
    title: "Problem-Solving",
    text: "Identify challenges, explore alternatives, and take effective action."
  },
  {
    title: "Critical & Creative Thinking",
    text: "Question assumptions, think independently, and discover new possibilities."
  },
  {
    title: "Relationship Skills",
    text: "Develop empathy, respect, healthy boundaries, cooperation, trust, and conflict-resolution skills."
  },
  {
    title: "Resilience & Adaptability",
    text: "Recover from setbacks and respond positively to change and uncertainty."
  },
  {
    title: "Self-Management",
    text: "Build discipline, focus, time management, healthy habits, and personal responsibility."
  },
  {
    title: "Purpose & Values",
    text: "Understand what truly matters and align your goals and actions with your values."
  }
];

const flagshipPrograms = [
  {
    number: "01",
    title: "Student Success",
    description:
      "Helping students develop focus, confidence, emotional intelligence, smart study habits, discipline, communication, and career clarity.",
    programs: [
      "ASM – Advanced Student Mindset",
      "ASM Masterclass",
      "Smart Study Techniques",
      "Educational & Motivational Student Program",
      "One-Day Student Transformation Program"
    ]
  },
  {
    number: "02",
    title: "Life Mastery",
    description:
      "Practical coaching for mindset transformation, emotional mastery, habits, purpose, mindfulness, and conscious living.",
    programs: [
      "Holistic Life Transformation Program",
      "Emotional Mastery Program",
      "Purpose & Passion Discovery Coaching",
      "Mindfulness & Meditation Mastery",
      "Morning Rituals Program"
    ]
  },
  {
    number: "03",
    title: "Career Success",
    description:
      "Helping students and young adults understand their strengths, interests, values, skills, and opportunities so they can make informed career decisions.",
    programs: [
      "Career Guidance Program",
      "Mind Power Online Program",
      "Career & Personal Mentoring"
    ]
  },
  {
    number: "04",
    title: "Business Growth",
    description:
      "Supporting professionals, entrepreneurs, salespeople, and small-business owners with mindset, communication, leadership, sales, productivity, and growth.",
    programs: [
      "Business Coaching",
      "Small Business Growth & Sales Program",
      "Sales Mastery Course",
      "One-Day Business Program"
    ]
  },
  {
    number: "05",
    title: "Holistic Wellness",
    description:
      "Supporting greater emotional balance, mindfulness, healthy living, relationships, inner awareness, and personal well-being.",
    programs: [
      "Stress & Anxiety Relief Counseling",
      "Emotional Healing Program",
      "Organic Lifestyle Program",
      "Art of Living with Spirituality Workshop"
    ]
  }
];

const audiences = [
  {
    title: "Students",
    text: "Focus, confidence, emotional intelligence, smart study skills, discipline, and career clarity."
  },
  {
    title: "Parents",
    text: "Understanding and supporting a child's mindset, emotions, habits, communication, and development."
  },
  {
    title: "Professionals",
    text: "Mindset, emotional balance, communication, relationships, productivity, and purpose."
  },
  {
    title: "Entrepreneurs",
    text: "Leadership, sales mindset, decision-making, confidence, productivity, and business growth."
  },
  {
    title: "Individuals",
    text: "Self-awareness, clarity, emotional balance, purpose, personal growth, and a more meaningful life."
  }
];

export default function WhoIsDeepakKhotPage() {
  return (
    <>
      {/* HERO */}
      <section className="overflow-hidden bg-sand">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">Who is Deepak Khot?</p>

            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
              Holistic Mindset & Life Coach
            </h1>

            <p className="mt-5 text-lg font-medium text-moss">
              Career Counselor · NLP Trainer · Trainer · Author
            </p>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
              With 15+ years of experience across corporate life, spirituality,
              coaching, and personal development, Deepak Khot helps people
              understand themselves, strengthen their mindset, develop crucial
              life skills, and move toward greater clarity, confidence,
              purpose, and meaningful success.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/programs" className="button-primary">
                Explore programs
              </Link>

              <Link href="/contact" className="button-secondary">
                Start your transformation
              </Link>
            </div>

            <p className="mt-6 font-display text-xl text-moss">
              Transform Your Mind • Transform Your Life
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[3rem] border border-coral/25" />

            <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-soft">
              <Image
                src="/images/deepak-khot.jpg"
                alt="Deepak Khot, Holistic Mindset & Life Coach"
                width={1617}
                height={1617}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">About Deepak</p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Helping people transform from within.
            </h2>
          </div>

          <div className="space-y-5 text-lg leading-8 text-ink/70">
            <p>
              Deepak Khot is a Holistic Mindset & Life Coach, Career Counselor,
              NLP Trainer, Trainer, and Author dedicated to helping individuals
              unlock their potential and create meaningful transformation.
            </p>

            <p>
              His work focuses on mindset transformation, mind power, emotional
              mastery, career guidance, NLP, stress management, confidence
              building, study and memory techniques, and personal development.
            </p>

            <p>
              His approach is practical and interactive, helping students,
              parents, professionals, entrepreneurs, and individuals overcome
              mental and emotional barriers and move toward greater clarity,
              confidence, and purposeful action.
            </p>

            <p>
              A major focus of his work is student transformation and career
              development. Through training programs, workshops, counseling,
              and personal mentoring, he helps young people strengthen focus,
              concentration, memory, emotional intelligence, communication,
              decision-making, digital discipline, and career clarity.
            </p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="My coaching philosophy"
            title="From awareness to transformation."
          >
            Lasting transformation begins when we understand ourselves more
            deeply. Deepak&apos;s approach combines modern mindset techniques, NLP,
            practical psychology, holistic living, and spiritual wisdom.
          </SectionHeading>

          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {[
              ["01", "Know Yourself", "Understand your thoughts, emotions, values, strengths, and patterns."],
              ["02", "Manage Yourself", "Develop emotional awareness, discipline, focus, and healthy habits."],
              ["03", "Connect with Others", "Build communication, empathy, trust, and healthier relationships."],
              ["04", "Handle Life", "Develop resilience, adaptability, decision-making, and problem-solving."],
              ["05", "Live with Purpose", "Align your goals, actions, and choices with what truly matters."]
            ].map(([number, title, text]) => (
              <article key={number} className="card bg-mist/60">
                <span className="text-sm font-semibold text-coral">
                  {number}
                </span>

                <h3 className="mt-6 font-display text-2xl">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-ink/65">
                  {text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-moss p-8 text-center text-white sm:p-10">
            <p className="font-display text-2xl sm:text-3xl">
              The goal is not simply to achieve more.
            </p>

            <p className="mx-auto mt-4 max-w-3xl leading-7 text-white/75">
              It is to become more conscious, capable, confident, balanced,
              and fulfilled while creating the success and life that truly
              matters to you.
            </p>
          </div>
        </div>
      </section>

      {/* LIFE SKILLS */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Crucial life skills"
          title="Skills for success. Skills for life."
        >
          Academic qualifications and professional knowledge matter, but life
          also requires skills that help us navigate emotions, relationships,
          decisions, challenges, and change.
        </SectionHeading>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lifeSkills.map((skill, index) => (
            <article key={skill.title} className="card">
              <span className="text-sm font-semibold text-coral">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-5 font-display text-2xl">
                {skill.title}
              </h3>

              <p className="mt-3 leading-7 text-ink/65">
                {skill.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="font-display text-2xl text-moss">
            Know Yourself → Manage Yourself → Connect with Others →
            Handle Challenges → Live with Purpose
          </p>
        </div>
      </section>

      {/* FLAGSHIP PORTFOLIO */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Coaching portfolio"
            title="Five pathways for meaningful growth."
          >
            Deepak&apos;s wider coaching portfolio includes specialized programs
            across student development, mindset, career, business, emotional
            well-being, relationships, and holistic living. These can be
            organized into five flagship areas.
          </SectionHeading>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {flagshipPrograms.map((category) => (
              <article key={category.number} className="card">
                <span className="text-sm font-semibold text-coral">
                  {category.number}
                </span>

                <h3 className="mt-5 font-display text-3xl">
                  {category.title}
                </h3>

                <p className="mt-4 leading-7 text-ink/65">
                  {category.description}
                </p>

                <div className="mt-6 border-t border-ink/10 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                    Selected programs
                  </p>

                  <ul className="mt-4 space-y-2 text-sm text-ink/70">
                    {category.programs.map((program) => (
                      <li key={program} className="flex gap-2">
                        <span className="text-coral">•</span>
                        <span>{program}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/programs" className="button-primary">
              Explore all programs
            </Link>
          </div>
        </div>
      </section>

      {/* WHO I WORK WITH */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Who I work with"
          title="Different journeys. One human-centered approach."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {audiences.map((audience) => (
            <article key={audience.title} className="card bg-sand">
              <h3 className="font-display text-2xl">
                {audience.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-ink/65">
                {audience.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* HOLISTIC MODEL */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="The holistic transformation model"
            title="Because every part of life is interconnected."
          >
            Career, emotions, relationships, habits, health, purpose, and
            consciousness influence one another. Holistic coaching looks at
            the person as a whole rather than treating every challenge as an
            isolated problem.
          </SectionHeading>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["MIND", "Thoughts • Beliefs • Focus • Learning • Mindset"],
              ["BODY", "Energy • Healthy Habits • Nutrition • Lifestyle"],
              ["EMOTIONS", "Awareness • Regulation • Resilience • Inner Balance"],
              ["RELATIONSHIPS", "Communication • Empathy • Boundaries • Connection"],
              ["PURPOSE", "Values • Goals • Direction • Meaning"],
              ["CONSCIOUSNESS", "Awareness • Gratitude • Compassion • Peace • Presence"]
            ].map(([title, text]) => (
              <article key={title} className="card">
                <p className="eyebrow">{title}</p>
                <p className="mt-4 font-display text-xl leading-8">
                  {text}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-10 text-center font-display text-2xl text-moss">
            When these dimensions grow together, transformation becomes
            holistic.
          </p>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="card bg-moss text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              My purpose
            </p>

            <h2 className="mt-5 font-display text-3xl">
              Empower people to transform from within.
            </h2>

            <p className="mt-5 leading-7 text-white/75">
              To help people develop crucial life skills, strengthen their
              mindset, discover their potential, make better life and career
              decisions, and connect with deeper qualities of consciousness.
            </p>
          </article>

          <article className="card bg-sand">
            <p className="eyebrow">My vision</p>

            <h2 className="mt-5 font-display text-3xl">
              Empowering people to live consciously and successfully.
            </h2>

            <p className="mt-5 leading-7 text-ink/65">
              To create a global community of individuals who are self-aware,
              emotionally intelligent, healthy, purposeful, compassionate, and
              empowered to create a positive impact.
            </p>
          </article>
        </div>

        <div className="mt-10 rounded-[2rem] border border-coral/20 bg-mist/60 p-8 text-center sm:p-12">
          <p className="eyebrow">A special focus</p>

          <h2 className="mt-4 font-display text-3xl sm:text-4xl">
            Empowering the younger generation.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-ink/65">
            A central part of Deepak&apos;s mission is helping young people develop
            the mindset, life skills, confidence, emotional intelligence, and
            career clarity needed to create successful careers and meaningful
            lives.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-5 overflow-hidden rounded-[2rem] bg-moss text-white lg:mx-auto lg:max-w-6xl">
        <div className="grid gap-8 px-7 py-12 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
              Start your journey
            </p>

            <h2 className="mt-3 max-w-2xl font-display text-4xl">
              Transform your mind. Transform your life.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-white/70">
              Whether you are looking for career clarity, stronger confidence,
              emotional balance, personal growth, business development, or a
              deeper sense of purpose, the first step can begin with a
              conversation.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
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