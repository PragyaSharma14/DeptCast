import prisma from '../db.js';

export const getDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTemplatesByDepartment = async (req, res) => {
    try {
        const { deptId } = req.params;
        const templates = await prisma.template.findMany({
            where: { departmentId: deptId },
            orderBy: { title: 'asc' }
        });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
