import prisma from '../db.js';

export const getWizardBootstrap = async (req, res) => {
    try {
        // We fetch everything in one query using Prisma's powerful inclusion logic
        const sectors = await prisma.sector.findMany({
            include: {
                departments: {
                    include: {
                        department: {
                            include: {
                                templates: {
                                    select: {
                                        id: true,
                                        title: true,
                                        key: true,
                                        keyPoints: true,
                                        // We don't need the heavy systemPrompt for the list view
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Format the nested many-to-many into a clean structure for the frontend
        const formattedData = sectors.map(sector => ({
            id: sector.id,
            name: sector.name,
            key: sector.key,
            color: sector.color,
            departments: sector.departments.map(sd => ({
                id: sd.department.id,
                name: sd.department.name,
                key: sd.department.key,
                templates: sd.department.templates
            }))
        }));

        res.json(formattedData);
    } catch (error) {
        console.error("Wizard Bootstrap Error:", error);
        res.status(500).json({ error: "Failed to initialize high-speed production data." });
    }
};
