import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, '..', 'video_platform_knowledge_base.json');

const DEPARTMENTS_MAP = {
    "hr": { name: "Human Resources", icon: "Users", color: "text-pink-400", bg: "bg-pink-400/10", desc: "For all major employee workflows" },
    "it-support": { name: "IT Support", icon: "Shield", color: "text-blue-400", bg: "bg-blue-400/10", desc: "For IT updates and alerts" },
    "marketing": { name: "Marketing", icon: "Palette", color: "text-brand", bg: "bg-brand/10", desc: "For campaigns and brand materials" },
    "operations": { name: "Operations", icon: "Briefcase", color: "text-green-400", bg: "bg-green-400/10", desc: "For processes and logistics" },
    "finance": { name: "Finance", icon: "DollarSign", color: "text-yellow-400", bg: "bg-yellow-400/10", desc: "For budgeting and payroll" },
    "admin": { name: "Admin", icon: "Settings", color: "text-gray-400", bg: "bg-gray-400/10", desc: "For administration workflows" },
    "quality": { name: "Quality", icon: "CheckCircle", color: "text-teal-400", bg: "bg-teal-400/10", desc: "For QA and compliance" },
    "generic": { name: "General Communications", icon: "MessageSquare", color: "text-indigo-400", bg: "bg-indigo-400/10", desc: "General purpose templates" }
};

const formatTitle = (key) => key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

async function reseed() {
    try {
        console.log("Wiping existing templates and departments...");
        await prisma.template.deleteMany({});
        await prisma.sectorDepartment.deleteMany({});
        await prisma.department.deleteMany({});

        console.log("Creating/Ensuring Sector 'technology-software'...");
        let sector = await prisma.sector.findUnique({ where: { key: 'technology-software' }});
        if (!sector) {
            sector = await prisma.sector.create({
                data: {
                    key: 'technology-software',
                    name: 'Technology & Software',
                    color: 'blue'
                }
            });
        }

        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const dbData = JSON.parse(rawData);

        console.log("Seeding departments and templates from JSON...");

        for (const [deptKey, templatesObj] of Object.entries(dbData.content_templates)) {
            const defaults = DEPARTMENTS_MAP[deptKey] || {
                name: formatTitle(deptKey), icon: "Folder", color: "text-gray-500", bg: "bg-gray-500/10", desc: "Standard communications"
            };

            const dept = await prisma.department.create({
                data: {
                    key: deptKey,
                    name: defaults.name,
                    icon: defaults.icon,
                    color: defaults.color,
                    bg: defaults.bg,
                    description: defaults.desc
                }
            });

            console.log(`Created Department: ${dept.name}`);

            await prisma.sectorDepartment.create({
                data: {
                    sectorId: sector.id,
                    departmentId: dept.id
                }
            });

            for (const [tplKey, tplData] of Object.entries(templatesObj)) {
                await prisma.template.create({
                    data: {
                        departmentId: dept.id,
                        key: tplKey,
                        title: formatTitle(tplKey),
                        systemPrompt: tplData.prompt || "",
                        keyPoints: JSON.stringify(tplData.key_points || [])
                    }
                });
            }
            console.log(` - Added ${Object.keys(templatesObj).length} templates to ${dept.name}`);
        }

        console.log("Reseeding complete!");
    } catch(err) {
        console.error("Reseeding failed: ", err);
    } finally {
        await prisma.$disconnect();
    }
}

reseed();
