import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    let sector = await prisma.sector.findUnique({ where: { key: 'technology-software' }});
    if (!sector) {
        sector = await prisma.sector.create({
            data: {
                key: 'technology-software',
                name: 'Technology & Software',
                color: 'blue'
            }
        });
        console.log("Created sector", sector);
    } else {
        console.log("Sector already exists", sector);
    }

    const depts = await prisma.department.findMany();
    for (const d of depts) {
        const link = await prisma.sectorDepartment.findUnique({
            where: {
                sectorId_departmentId: {
                    sectorId: sector.id,
                    departmentId: d.id
                }
            }
        });
        if (!link) {
            await prisma.sectorDepartment.create({
                data: {
                    sectorId: sector.id,
                    departmentId: d.id
                }
            });
            console.log("Linked dept", d.name);
        }
    }
    console.log("All done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
