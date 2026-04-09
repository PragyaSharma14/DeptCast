import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSectors = async (req, res) => {
  try {
    const sectors = await prisma.sector.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDepartmentsBySector = async (req, res) => {
  try {
    const { sectorId } = req.params;
    
    // Find departments through the SectorDepartment join table
    const sectorDepts = await prisma.sectorDepartment.findMany({
      where: { sectorId },
      include: {
        department: true
      }
    });

    const departments = sectorDepts.map(sd => sd.department);
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
