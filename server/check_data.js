import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
  try {
    const orgs = await prisma.organization.count();
    const users = await prisma.user.count();
    const projects = await prisma.project.count();
    const scenes = await prisma.scene.count();
    const templates = await prisma.template.count();
    const sectors = await prisma.sector.count();
    const depts = await prisma.department.count();

    console.log("--- LOCAL DATABASE DATA SUMMARY ---");
    console.log(`Organizations: ${orgs}`);
    console.log(`Users:         ${users}`);
    console.log(`Projects:      ${projects}`);
    console.log(`Scenes:        ${scenes}`);
    console.log(`Templates:     ${templates}`);
    console.log(`Sectors:       ${sectors}`);
    console.log(`Departments:   ${depts}`);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("Error connecting to DB:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
