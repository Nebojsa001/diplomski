const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Manji set MKB-10 šifri za start - po potrebi proširiti listu.
const diagnoses = [
  { code: "I10", name: "Esencijalna (primarna) hipertenzija" },
  { code: "E11", name: "Dijabetes mellitus tip 2" },
  { code: "J06.9", name: "Akutna infekcija gornjih disajnih puteva, neopredijeljena" },
  { code: "J20.9", name: "Akutni bronhitis, neopredijeljen" },
  { code: "M54.5", name: "Bol u krstima (lumbago)" },
  { code: "K29.7", name: "Gastritis, neopredijeljen" },
  { code: "R51", name: "Glavobolja" },
  { code: "J45.9", name: "Astma, neopredijeljena" },
  { code: "N39.0", name: "Infekcija urinarnog trakta, nespecificirana lokalizacija" },
  { code: "E03.9", name: "Hipotireoza, neopredijeljena" },
];

async function main() {
  for (const diagnosis of diagnoses) {
    await prisma.diagnosis.upsert({
      where: { code: diagnosis.code },
      update: { name: diagnosis.name },
      create: diagnosis,
    });
  }

  console.log(`Seed završen: ${diagnoses.length} MKB-10 dijagnoza.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
