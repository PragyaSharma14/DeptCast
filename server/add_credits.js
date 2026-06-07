import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const orgs = await prisma.organization.findMany();
    for (const org of orgs) {
        await prisma.organization.update({
            where: { id: org.id },
            data: { credits: 10000 }
        });
        console.log(`Updated org ${org.name} (${org.id}) with 10000 credits.`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
