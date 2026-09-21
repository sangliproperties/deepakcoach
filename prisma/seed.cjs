const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("node:crypto");

const prisma = new PrismaClient();

function passwordHash(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const programs = [
  {
    id: "clarity-call",
    slug: "clarity-call",
    title: "Clarity Call",
    tagline: "A calm first step toward a more intentional next step.",
    description: "A focused one-to-one conversation to name what feels stuck, explore what matters now, and leave with one practical next step.",
    durationMins: 30,
    priceInr: 0,
    format: "Online, one-to-one",
    inclusions: ["30-minute guided conversation", "One written next-step prompt", "A respectful, confidential space"],
    eligibility: "For adults exploring a coaching conversation for the first time.",
    expectations: "Please join from a quiet place and bring one question you would like to think through."
  },
  {
    id: "focused-growth",
    slug: "focused-growth",
    title: "Focused Growth Session",
    tagline: "Turn one meaningful goal into a workable plan.",
    description: "A structured coaching session for people ready to examine a goal, understand the blockers, and choose an action they can own.",
    durationMins: 60,
    priceInr: 1499,
    format: "Online, one-to-one",
    inclusions: ["60-minute coaching session", "Goal and action reflection", "Follow-up summary with agreed actions"],
    eligibility: "For adults who have a specific personal or professional goal to explore.",
    expectations: "Payment is required to confirm a paid booking. You will receive the meeting details after verification."
  },
  {
    id: "direction-series",
    slug: "direction-series",
    title: "Direction Series",
    tagline: "Three conversations to create room for deliberate change.",
    description: "A three-session coaching package for building awareness, making a grounded decision, and reviewing progress with compassion.",
    durationMins: 60,
    priceInr: 3999,
    format: "Online, one-to-one · 3 sessions",
    inclusions: ["Three 60-minute sessions", "Between-session reflection prompts", "Simple progress review"],
    eligibility: "For adults ready to commit time between sessions to reflection and action.",
    expectations: "This package is introduced by enquiry in the MVP; individual slots are booked after a fit conversation."
  }
];

async function main() {
  const users = [
    ["demo-admin", process.env.SEED_ADMIN_EMAIL || "admin@deepakcoach.local", process.env.SEED_ADMIN_PASSWORD || "Admin@123", "MVP Administrator", "ADMIN"],
    ["demo-coach", process.env.SEED_COACH_EMAIL || "coach@deepakcoach.local", process.env.SEED_COACH_PASSWORD || "Coach@123", "Demo Coach", "COACH"],
    ["demo-customer", process.env.SEED_CUSTOMER_EMAIL || "hello@example.com", process.env.SEED_CUSTOMER_PASSWORD || "Demo@123", "Demo Customer", "CUSTOMER"]
  ];
  for (const [id, email, password, name, role] of users) {
    await prisma.user.upsert({
      where: { id },
      create: { id, email: email.toLowerCase(), name, role, passwordHash: passwordHash(password), registeredAt: new Date() },
      update: { email: email.toLowerCase(), name, role }
    });
  }
  for (const program of programs) {
    await prisma.program.upsert({ where: { id: program.id }, create: program, update: program });
  }
  await prisma.businessPolicy.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} });
  for (let day = 1; day <= 7; day += 1) {
    for (let index = 0; index < 3; index += 1) {
      const start = new Date();
      start.setDate(start.getDate() + day);
      start.setHours(10 + index * 2, 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      await prisma.availability.upsert({
        where: { id: `seed-slot-${day}-${index}` },
        create: { id: `seed-slot-${day}-${index}`, startsAt: start, endsAt: end },
        update: {}
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
