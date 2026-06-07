import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const departments = [
    {
        "name": "Human Resources",
        "description": "Human Resources internal communications and training blueprints."
    },
    {
        "name": "Finance & Accounts",
        "description": "Finance & Accounts internal communications and training blueprints."
    },
    {
        "name": "Administration",
        "description": "Administration internal communications and training blueprints."
    },
    {
        "name": "Legal & Compliance",
        "description": "Legal & Compliance internal communications and training blueprints."
    },
    {
        "name": "IT & Technology",
        "description": "IT & Technology internal communications and training blueprints."
    },
    {
        "name": "Marketing",
        "description": "Marketing internal communications and training blueprints."
    },
    {
        "name": "Sales",
        "description": "Sales internal communications and training blueprints."
    },
    {
        "name": "Customer Service",
        "description": "Customer Service internal communications and training blueprints."
    },
    {
        "name": "Procurement",
        "description": "Procurement internal communications and training blueprints."
    },
    {
        "name": "Operations",
        "description": "Operations internal communications and training blueprints."
    },
    {
        "name": "Production",
        "description": "Production internal communications and training blueprints."
    },
    {
        "name": "Quality Control",
        "description": "Quality Control internal communications and training blueprints."
    },
    {
        "name": "Engineering",
        "description": "Engineering internal communications and training blueprints."
    },
    {
        "name": "Supply Chain",
        "description": "Supply Chain internal communications and training blueprints."
    },
    {
        "name": "Maintenance",
        "description": "Maintenance internal communications and training blueprints."
    },
    {
        "name": "Research & Development",
        "description": "Research & Development internal communications and training blueprints."
    },
    {
        "name": "Health & Safety",
        "description": "Health & Safety internal communications and training blueprints."
    },
    {
        "name": "Environmental",
        "description": "Environmental internal communications and training blueprints."
    },
    {
        "name": "Clinical Services",
        "description": "Clinical Services internal communications and training blueprints."
    },
    {
        "name": "Nursing",
        "description": "Nursing internal communications and training blueprints."
    },
    {
        "name": "Pharmacy",
        "description": "Pharmacy internal communications and training blueprints."
    },
    {
        "name": "Laboratory",
        "description": "Laboratory internal communications and training blueprints."
    },
    {
        "name": "Radiology",
        "description": "Radiology internal communications and training blueprints."
    },
    {
        "name": "Patient Services",
        "description": "Patient Services internal communications and training blueprints."
    },
    {
        "name": "Medical Administration",
        "description": "Medical Administration internal communications and training blueprints."
    },
    {
        "name": "Infection Control",
        "description": "Infection Control internal communications and training blueprints."
    },
    {
        "name": "Retail Banking",
        "description": "Retail Banking internal communications and training blueprints."
    },
    {
        "name": "Corporate Banking",
        "description": "Corporate Banking internal communications and training blueprints."
    },
    {
        "name": "Risk & Compliance",
        "description": "Risk & Compliance internal communications and training blueprints."
    },
    {
        "name": "Investment",
        "description": "Investment internal communications and training blueprints."
    },
    {
        "name": "Treasury",
        "description": "Treasury internal communications and training blueprints."
    },
    {
        "name": "Audit & Assurance",
        "description": "Audit & Assurance internal communications and training blueprints."
    },
    {
        "name": "Loans & Credit",
        "description": "Loans & Credit internal communications and training blueprints."
    },
    {
        "name": "Insurance",
        "description": "Insurance internal communications and training blueprints."
    },
    {
        "name": "Academic",
        "description": "Academic internal communications and training blueprints."
    },
    {
        "name": "Admissions",
        "description": "Admissions internal communications and training blueprints."
    },
    {
        "name": "Student Affairs",
        "description": "Student Affairs internal communications and training blueprints."
    },
    {
        "name": "Research",
        "description": "Research internal communications and training blueprints."
    },
    {
        "name": "Curriculum Development",
        "description": "Curriculum Development internal communications and training blueprints."
    },
    {
        "name": "Library",
        "description": "Library internal communications and training blueprints."
    },
    {
        "name": "Examination",
        "description": "Examination internal communications and training blueprints."
    },
    {
        "name": "Alumni Relations",
        "description": "Alumni Relations internal communications and training blueprints."
    },
    {
        "name": "Merchandising",
        "description": "Merchandising internal communications and training blueprints."
    },
    {
        "name": "Inventory & Warehouse",
        "description": "Inventory & Warehouse internal communications and training blueprints."
    },
    {
        "name": "Store Operations",
        "description": "Store Operations internal communications and training blueprints."
    },
    {
        "name": "E-commerce",
        "description": "E-commerce internal communications and training blueprints."
    },
    {
        "name": "Visual Merchandising",
        "description": "Visual Merchandising internal communications and training blueprints."
    },
    {
        "name": "Customer Experience",
        "description": "Customer Experience internal communications and training blueprints."
    },
    {
        "name": "Content Creation",
        "description": "Content Creation internal communications and training blueprints."
    },
    {
        "name": "Broadcast",
        "description": "Broadcast internal communications and training blueprints."
    },
    {
        "name": "Digital Media",
        "description": "Digital Media internal communications and training blueprints."
    },
    {
        "name": "Public Relations",
        "description": "Public Relations internal communications and training blueprints."
    },
    {
        "name": "Creative Design",
        "description": "Creative Design internal communications and training blueprints."
    },
    {
        "name": "Distribution",
        "description": "Distribution internal communications and training blueprints."
    },
    {
        "name": "Transport",
        "description": "Transport internal communications and training blueprints."
    },
    {
        "name": "Warehousing",
        "description": "Warehousing internal communications and training blueprints."
    },
    {
        "name": "Fleet Management",
        "description": "Fleet Management internal communications and training blueprints."
    },
    {
        "name": "Last-Mile Delivery",
        "description": "Last-Mile Delivery internal communications and training blueprints."
    },
    {
        "name": "Import & Export",
        "description": "Import & Export internal communications and training blueprints."
    },
    {
        "name": "Customs & Compliance",
        "description": "Customs & Compliance internal communications and training blueprints."
    },
    {
        "name": "Policy & Planning",
        "description": "Policy & Planning internal communications and training blueprints."
    },
    {
        "name": "Public Works",
        "description": "Public Works internal communications and training blueprints."
    },
    {
        "name": "Revenue",
        "description": "Revenue internal communications and training blueprints."
    },
    {
        "name": "Social Welfare",
        "description": "Social Welfare internal communications and training blueprints."
    },
    {
        "name": "Law Enforcement",
        "description": "Law Enforcement internal communications and training blueprints."
    },
    {
        "name": "Property Management",
        "description": "Property Management internal communications and training blueprints."
    },
    {
        "name": "Sales & Leasing",
        "description": "Sales & Leasing internal communications and training blueprints."
    },
    {
        "name": "Construction",
        "description": "Construction internal communications and training blueprints."
    },
    {
        "name": "Facilities Management",
        "description": "Facilities Management internal communications and training blueprints."
    },
    {
        "name": "Legal & Documentation",
        "description": "Legal & Documentation internal communications and training blueprints."
    }
];

const templates = [
    {
        "key": "employee-on-boarding",
        "title": "Employee On Boarding",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "security-policy-change",
        "title": "Security Policy Change",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "desktop-security",
        "title": "Desktop Security",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "product-demo-promotion-video",
        "title": "Product demo / promotion video",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "employee-on-boarding",
        "title": "Employee On Boarding",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "power-saving",
        "title": "Power saving",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "vehicle-booking-travel",
        "title": "Vehicle booking - Travel",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "employee-on-boarding",
        "title": "Employee On Boarding",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "vehical-lease-policy",
        "title": "Vehical lease policy",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "town-hall",
        "title": "Town Hall",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "desk-hygiene",
        "title": "Desk Hygiene",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "festival-celebration",
        "title": "Festival celebration",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "office-event-picnic",
        "title": "Office Event - picnic",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "leave",
        "title": "Leave",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "lta",
        "title": "LTA",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "working-hours",
        "title": "Working Hours",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "work-from-home",
        "title": "Work from Home",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "mediclaim",
        "title": "Mediclaim",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "client-visits",
        "title": "Client Visits",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "announcement",
        "title": "Announcement",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "overtime-policy",
        "title": "Overtime Policy",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "hr-policy",
        "title": "HR policy",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "maternity-leave-policy",
        "title": "Maternity leave policy",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "special-epf",
        "title": "Special EPF",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "onboarding-briefing",
        "title": "Onboarding - briefing",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "onboarding-briefing",
        "title": "Onboarding - briefing",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "workplace-safety",
        "title": "Workplace safety",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "how-to-use-internal-softwares",
        "title": "How to use internal Softwares",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "onboarding-briefing",
        "title": "Onboarding - briefing",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "product-demos",
        "title": "Product Demos",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "cost-saving",
        "title": "Cost Saving",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "how-to-prepare-budgets",
        "title": "How to prepare budgets",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "how-to-file-returns",
        "title": "How to file returns",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "how-to-save-tax",
        "title": "How to save tax",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "income-tax-policy",
        "title": "Income tax policy",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "submit-bills",
        "title": "Submit bills",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "employee-on-boarding",
        "title": "Employee On Boarding",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "quality-process",
        "title": "Quality process",
        "systemPrompt": "",
        "keyPoints": ""
    },
    {
        "key": "employee-on-boarding",
        "title": "Employee On Boarding",
        "systemPrompt": "",
        "keyPoints": ""
    }
];

async function main() {
    console.log("Seeding departments...");
    for (const d of departments) {
        const existing = await prisma.department.findFirst({ where: { name: d.name } });
        if (!existing) {
            await prisma.department.create({ 
                data: { ...d, key: d.name.toLowerCase().replace(/\s+/g, '-') } 
            });
        }
    }

    console.log("Seeding templates...");
    const dbDepartments = await prisma.department.findMany();
    for (let i = 0; i < templates.length; i++) {
        const t = templates[i];
        const existing = await prisma.template.findFirst({ where: { key: t.key } });
        if (!existing) {
            // Distribute templates somewhat evenly across departments
            const assignedDept = dbDepartments[i % dbDepartments.length];
            await prisma.template.create({ 
                data: { ...t, departmentId: assignedDept.id } 
            });
        }
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
