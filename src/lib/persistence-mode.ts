import "server-only";

export type PersistenceMode = "demo" | "prisma";

const configuredMode = process.env.PERSISTENCE_MODE?.toLowerCase();
const legacyDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE?.toLowerCase() === "true";

export const persistenceMode: PersistenceMode =
  configuredMode === "prisma"
    ? "prisma"
    : configuredMode === "demo" || legacyDemoMode
      ? "demo"
      : "prisma";

if (persistenceMode === "prisma" && !process.env.DATABASE_URL) {
  throw new Error("PERSISTENCE_MODE=prisma requires DATABASE_URL.");
}

if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build" && persistenceMode !== "prisma") {
  throw new Error("Demo persistence is disabled in production. Set PERSISTENCE_MODE=prisma.");
}
