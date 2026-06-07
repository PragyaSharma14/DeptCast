import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanTemplates() {
    console.log("Cleaning bloated template structures...");
    const result = await prisma.template.updateMany({
        data: {
            systemPrompt: "",
            keyPoints: ""
        }
    });
    console.log(`Successfully cleared ${result.count} templates.`);
}

cleanTemplates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
