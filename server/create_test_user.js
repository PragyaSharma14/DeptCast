import prisma from './db.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
    const email = "test@example.com";
    const password = "password123";
    
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        console.log("Test user already exists:", email);
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [user, org] = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                name: "Test Admin",
                email,
                passwordHash
            }
        });

        const newOrg = await tx.organization.create({
            data: {
                name: "Test Workspace"
            }
        });

        await tx.membership.create({
            data: {
                userId: newUser.id,
                organizationId: newOrg.id,
                role: 'admin'
            }
        });

        await tx.user.update({
            where: { id: newUser.id },
            data: { currentOrganizationId: newOrg.id }
        });
        
        return [newUser, newOrg];
    });

    console.log("Test user created:", email);
}

createTestUser().finally(() => prisma.$disconnect());
