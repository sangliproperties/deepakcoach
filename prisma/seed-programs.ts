import { PrismaClient } from "@prisma/client";
import { programs } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting program seed...");

  for (const program of programs) {
    await prisma.program.upsert({
      where: {
        id: program.id
      },

      update: {
        slug: program.slug,
        title: program.title,
        tagline: program.tagline,
        description: program.description,
        durationMins: program.durationMins,
        priceInr: program.priceInr,
        format: program.format,
        inclusions: program.inclusions,
        eligibility: program.eligibility,
        expectations: program.expectations,
        featured: program.featured ?? false,
        active: true
      },

      create: {
        id: program.id,
        slug: program.slug,
        title: program.title,
        tagline: program.tagline,
        description: program.description,
        durationMins: program.durationMins,
        priceInr: program.priceInr,
        format: program.format,
        inclusions: program.inclusions,
        eligibility: program.eligibility,
        expectations: program.expectations,
        featured: program.featured ?? false,
        active: true
      }
    });

    console.log(`Synced program: ${program.title}`);
  }

  console.log("Program seed completed.");
}

main()
  .catch((error) => {
    console.error("Program seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });