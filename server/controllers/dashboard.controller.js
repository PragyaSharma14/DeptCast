import prisma from '../db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const orgId = req.headers['x-organization-id'] || req.user.currentOrganizationId;
        
        // 1. Get real counts from the database
        const totalProjects = await prisma.project.count({ where: { organizationId: orgId } });
        const completedVideos = await prisma.project.count({ 
            where: { 
                organizationId: orgId,
                status: 'completed'
            } 
        });

        // 2. Fetch or Create Analytics Snapshot for this org
        let analytics = await prisma.analyticsSnapshot.findUnique({
            where: { organizationId: orgId }
        });

        if (!analytics) {
            // Initialize with zeroes for new orgs
            analytics = await prisma.analyticsSnapshot.create({
                data: {
                    organizationId: orgId,
                    totalReach: 0,
                    engagementRate: 0.0,
                    totalVideos: completedVideos,
                    activeUsers: 1 // Current user
                }
            });
        } else {
            // Sync current project count if it changed
            if (analytics.totalVideos !== completedVideos) {
                analytics = await prisma.analyticsSnapshot.update({
                    where: { organizationId: orgId },
                    data: { totalVideos: completedVideos }
                });
            }
        }

        res.json({
            stats: {
                totalMessages: analytics.totalReach,
                employeesReached: analytics.totalReach * 42, // Mocking a multiplier for reach
                engagementRate: analytics.engagementRate,
                totalVideos: analytics.totalVideos,
                activeUsers: analytics.activeUsers
            },
            topPerforming: {
                title: "Quarterly CEO Update",
                engagement: "94%",
                department: "Executive"
            }
        });
    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

export const getUpcomingSchedules = async (req, res) => {
    try {
        const orgId = req.headers['x-organization-id'] || req.user.currentOrganizationId;
        
        const schedules = await prisma.communicationSchedule.findMany({
            where: { 
                organizationId: orgId,
                scheduledAt: { gte: new Date() }
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5,
            include: { project: true }
        });

        res.json(schedules);
    } catch (err) {
        console.error("Schedules Fetch Error:", err);
        res.status(500).json({ error: 'Failed to fetch upcoming schedules' });
    }
};

export const createSchedule = async (req, res) => {
    const { title, scheduledAt, projectId } = req.body;
    try {
        const orgId = req.headers['x-organization-id'] || req.user.currentOrganizationId;
        
        const schedule = await prisma.communicationSchedule.create({
            data: {
                title,
                scheduledAt: new Date(scheduledAt),
                organizationId: orgId,
                projectId
            }
        });
        
        res.status(201).json(schedule);
    } catch (err) {
        console.error("Schedule Create Error:", err);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
};
