import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './db.js';

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

async function seed() {
    try {
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const dbData = JSON.parse(rawData);

        console.log("Seeding started...");

        // Insert Departments and their Templates
        for (const [deptKey, templatesObj] of Object.entries(dbData.content_templates)) {
            const defaults = DEPARTMENTS_MAP[deptKey] || {
                name: formatTitle(deptKey), icon: "Folder", color: "text-gray-500", bg: "bg-gray-500/10", desc: "Standard communications"
            };

            const dept = await prisma.department.upsert({
                where: { key: deptKey },
                update: {
                    name: defaults.name,
                    icon: defaults.icon,
                    color: defaults.color,
                    bg: defaults.bg,
                    description: defaults.desc
                },
                create: {
                    key: deptKey,
                    name: defaults.name,
                    icon: defaults.icon,
                    color: defaults.color,
                    bg: defaults.bg,
                    description: defaults.desc
                }
            });

            console.log(`Upserted Department: ${dept.name}`);

            for (const [tplKey, tplData] of Object.entries(templatesObj)) {
                
                // Try and find an existing template so we don't duplicate
                let existingTpl = await prisma.template.findFirst({
                    where: { departmentId: dept.id, key: tplKey }
                });

                if (existingTpl) {
                    await prisma.template.update({
                        where: { id: existingTpl.id },
                        data: {
                            title: formatTitle(tplKey),
                            systemPrompt: tplData.prompt || "",
                            keyPoints: JSON.stringify(tplData.key_points || [])
                        }
                    });
                } else {
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
                console.log(` - Upserted Template: ${tplKey}`);
            }
        }

        console.log("Seeding complete!");
    } catch(err) {
        console.error("Seeding failed: ", err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
