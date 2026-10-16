import bcrypt from "bcrypt";

import { prisma } from "../src/db/prisma.js";

const adminEmail = "admin.seed@example.com";
const userEmail = "user.seed@example.com";
const developmentPassword = "EventBook-Dev-Only-123!";

const events = [
  {
    title: "Developers Event",
    description: "An event for developers.",
    startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    venue: "History Hall",
    totalSeats: 100,
  },
  {
    title: "AI Workshop",
    description: "A workshop on artificial intelligence.",
    startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    venue: "Workshop Room",
    totalSeats: 2,
  },
  {
    title: "TypeScript Meetup",
    description: "An evening meetup for TypeScript developers.",
    startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    venue: "Tech Center",
    totalSeats: 50,
  },
  {
    title: "Product Design Talk",
    description: "A practical talk about product design.",
    startsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    venue: "Design Studio",
    totalSeats: 40,
  },
  {
    title: "Community Networking Night",
    description: "An informal evening for local professionals.",
    startsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    venue: "Community Lounge",
    totalSeats: 75,
  },
  {
    title: "Backend Engineering Conference",
    description: "A full day of backend engineering sessions.",
    startsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    venue: "Conference Center",
    totalSeats: 200,
  },
];

const seedData = async () => {
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(developmentPassword, 12);

  const admin = await prisma.user.create({
    data: {
      name: "Development Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Development User",
      email: userEmail,
      passwordHash,
      role: "USER",
    },
  });

  const createdEvents = await prisma.event.createManyAndReturn({
    data: events,
  });

  const workshop = createdEvents.find((event) => event.title === "AI Workshop");

  if (!workshop) {
    throw new Error("Seed workshop was not created.");
  }

  await prisma.booking.create({
    data: {
      userId: user.id,
      eventId: workshop.id,
      status: "CONFIRMED",
    },
  });

  console.log(
    `Seeded ${admin.email}, ${user.email}, ${createdEvents.length} events, and 1 booking.`,
  );
};

seedData()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
