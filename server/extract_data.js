import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function extractData() {
    const departments = await prisma.department.findMany({
        select: {
            name: true,
            description: true
        }
    });

    const templates = await prisma.template.findMany({
        select: {
            key: true,
            title: true,
            systemPrompt: true,
            keyPoints: true
        }
    });

    const seedContent = `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const departments = ${JSON.stringify(departments, null, 4)};

const templates = ${JSON.stringify(templates, null, 4)};

async function main() {
    console.log("Seeding departments...");
    for (const d of departments) {
        await prisma.department.upsert({
            where: { name: d.name },
            update: {},
            create: d
        });
    }

    console.log("Seeding templates...");
    for (const t of templates) {
        await prisma.template.upsert({
            where: { key: t.key },
            update: {},
            create: t
        });
    }
    console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
`;

    fs.writeFileSync('./prisma/seed.js', seedContent);
    console.log("seed.js created successfully!");
}

extractData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
