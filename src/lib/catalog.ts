import type { Program } from "@/lib/types";

export const programs: Program[] = [
  {
    id: "clarity-call",
    slug: "clarity-call",
    title: "Clarity Call",
    tagline: "A calm first step toward a more intentional next step.",
    description:
      "A focused one-to-one conversation to name what feels stuck, explore what matters now, and leave with one practical next step.",
    durationMins: 30,
    priceInr: 0,
    format: "Online, one-to-one",
    inclusions: ["30-minute guided conversation", "One written next-step prompt", "A respectful, confidential space"],
    eligibility: "For adults exploring a coaching conversation for the first time.",
    expectations: "Please join from a quiet place and bring one question you would like to think through.",
    featured: true
  },
  {
    id: "focused-growth",
    slug: "focused-growth",
    title: "Focused Growth Session",
    tagline: "Turn one meaningful goal into a workable plan.",
    description:
      "A structured coaching session for people ready to examine a goal, understand the blockers, and choose an action they can own.",
    durationMins: 60,
    priceInr: 1499,
    format: "Online, one-to-one",
    inclusions: ["60-minute coaching session", "Goal and action reflection", "Follow-up summary with agreed actions"],
    eligibility: "For adults who have a specific personal or professional goal to explore.",
    expectations: "Payment is required to confirm a paid booking. You will receive the meeting details after verification.",
    featured: true
  },
  {
    id: "direction-series",
    slug: "direction-series",
    title: "Direction Series",
    tagline: "Three conversations to create room for deliberate change.",
    description:
      "A three-session coaching package for building awareness, making a grounded decision, and reviewing progress with compassion.",
    durationMins: 60,
    priceInr: 3999,
    format: "Online, one-to-one · 3 sessions",
    inclusions: ["Three 60-minute sessions", "Between-session reflection prompts", "Simple progress review"],
    eligibility: "For adults ready to commit time between sessions to reflection and action.",
    expectations: "This package is introduced by enquiry in the MVP; individual slots are booked after a fit conversation.",
    featured: false
  }
];

export function getProgram(id: string) {
  return programs.find((program) => program.id === id || program.slug === id);
}

export function formatInr(amount: number) {
  return amount === 0
    ? "Free"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
