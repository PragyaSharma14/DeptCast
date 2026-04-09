import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Slugify function to match frontend/old logic
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log('Starting migration to Sector -> Department hierarchy...');

  // 1. Data Definitions
  const INDUSTRIES = [
    "Technology / Software", "Banking & Finance", "Healthcare & Pharma",
    "Manufacturing & Engineering", "Retail & E-commerce", "Education & Training",
    "Media & Entertainment", "Logistics & Supply Chain", "Real Estate",
    "Consulting & Professional Services", "Government & Public Sector"
  ];

  const DEPARTMENT_GROUPS = [
    { group: "Corporate & General", depts: ["Human Resources", "Finance & Accounts", "Administration", "Legal & Compliance", "IT & Technology", "Marketing", "Sales", "Customer Service", "Procurement", "Operations"] },
    { group: "Manufacturing & Engineering", depts: ["Production", "Quality Control", "Engineering", "Supply Chain", "Maintenance", "Research & Development", "Health & Safety", "Environmental"] },
    { group: "Healthcare & Pharma", depts: ["Clinical Services", "Nursing", "Pharmacy", "Laboratory", "Radiology", "Patient Services", "Medical Administration", "Infection Control"] },
    { group: "Banking & Finance", depts: ["Retail Banking", "Corporate Banking", "Risk & Compliance", "Investment", "Treasury", "Audit & Assurance", "Loans & Credit", "Insurance"] },
    { group: "Education & Training", depts: ["Academic", "Admissions", "Student Affairs", "Research", "Curriculum Development", "Library", "Examination", "Alumni Relations"] },
    { group: "Retail & E-commerce", depts: ["Merchandising", "Inventory & Warehouse", "Store Operations", "E-commerce", "Visual Merchandising", "Customer Experience"] },
    { group: "Media & Entertainment", depts: ["Content Creation", "Production", "Broadcast", "Digital Media", "Public Relations", "Creative Design", "Distribution"] },
    { group: "Logistics & Supply Chain", depts: ["Transport", "Warehousing", "Fleet Management", "Last-Mile Delivery", "Import & Export", "Customs & Compliance"] },
    { group: "Government & Public Sector", depts: ["Policy & Planning", "Public Works", "Revenue", "Social Welfare", "Law Enforcement", "Public Relations"] },
    { group: "Real Estate", depts: ["Property Management", "Sales & Leasing", "Construction", "Facilities Management", "Legal & Documentation"] }
  ];

  const INDUSTRY_TO_GROUPS = {
    "Technology / Software": ["Corporate & General"],
    "Banking & Finance": ["Banking & Finance", "Corporate & General"],
    "Healthcare & Pharma": ["Healthcare & Pharma", "Corporate & General"],
    "Manufacturing & Engineering": ["Manufacturing & Engineering", "Corporate & General"],
    "Retail & E-commerce": ["Retail & E-commerce", "Corporate & General"],
    "Education & Training": ["Education & Training", "Corporate & General"],
    "Media & Entertainment": ["Media & Entertainment", "Corporate & General"],
    "Logistics & Supply Chain": ["Logistics & Supply Chain", "Corporate & General"],
    "Real Estate": ["Real Estate", "Corporate & General"],
    "Consulting & Professional Services": ["Corporate & General"],
    "Government & Public Sector": ["Government & Public Sector", "Corporate & General"]
  };

  // 2. Load Templates
  const kbPath = path.join(__dirname, '../../video_platform_knowledge_base.json');
  const kbData = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
  const contentTemplates = kbData.content_templates;

  // Mapping from KB keys to friendly names in DEPARTMENT_GROUPS
  const kbMapping = {
    'hr': 'Human Resources',
    'it-support': 'IT & Technology',
    'operations': 'Operations',
    'marketing': 'Marketing',
    'admin': 'Administration',
    'finance': 'Finance & Accounts',
    'quality': 'Quality Control'
  };

  // 3. Clear Existing Data
  console.log('Cleaning up old records...');
  try {
    await prisma.template.deleteMany();
    await prisma.sectorDepartment.deleteMany();
    await prisma.department.deleteMany();
    await prisma.sector.deleteMany();
  } catch (err) {
    console.log('Cleanup error (might be first run):', err.message);
  }

  // 4. Create Sectors
  console.log('Creating Sectors...');
  const sectorMap = {};
  for (const ind of INDUSTRIES) {
    const sector = await prisma.sector.create({
      data: {
        name: ind,
        key: slugify(ind),
      }
    });
    sectorMap[ind] = sector;
  }

  // 5. Create Departments and Link to Sectors
  console.log('Creating Departments and linkages...');
  const deptMap = {}; // name -> DB object
  
  for (const group of DEPARTMENT_GROUPS) {
    for (const deptName of group.depts) {
      // Create Department if it doesn't exist
      if (!deptMap[deptName]) {
        deptMap[deptName] = await prisma.department.create({
          data: {
            name: deptName,
            key: slugify(deptName),
            description: `${deptName} internal communications and training blueprints.`,
          }
        });
      }

      // Link to all sectors that include this group
      for (const [indName, groups] of Object.entries(INDUSTRY_TO_GROUPS)) {
        if (groups.includes(group.group)) {
          await prisma.sectorDepartment.create({
            data: {
              sectorId: sectorMap[indName].id,
              departmentId: deptMap[deptName].id
            }
          }).catch(() => {}); // Ignore duplicates
        }
      }
    }
  }

  // 6. Import Templates
  console.log('Importing Templates...');
  for (const [kbKey, templatesObj] of Object.entries(contentTemplates)) {
    const friendlyDeptName = kbMapping[kbKey];
    if (!friendlyDeptName) continue;

    const dept = deptMap[friendlyDeptName];
    if (!dept) {
      console.warn(`Could not find department for KB key: ${kbKey}`);
      continue;
    }

    for (const [tplKey, tplData] of Object.entries(templatesObj)) {
      await prisma.template.create({
        data: {
          departmentId: dept.id,
          key: slugify(tplKey),
          title: tplKey,
          systemPrompt: tplData.prompt,
          keyPoints: JSON.stringify(tplData.key_points)
        }
      });
    }
  }

  console.log('Migration Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
