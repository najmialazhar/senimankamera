import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";

// Manually load .env variables
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
        process.env[key] = value;
      }
    });
    console.log("Successfully loaded .env variables.");
  }
} catch (e) {
  console.error("Failed to load .env manually:", e);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database truncation...");

  try {
    console.log("Deleting CalendarSlot...");
    await prisma.calendarSlot.deleteMany();

    console.log("Deleting Booking...");
    await prisma.booking.deleteMany();

    console.log("Deleting Client...");
    await prisma.client.deleteMany();

    console.log("Deleting Package...");
    await prisma.package.deleteMany();

    console.log("Deleting Category...");
    await prisma.category.deleteMany();

    console.log("Deleting Gallery...");
    await prisma.gallery.deleteMany();

    console.log("Database cleared successfully!");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
