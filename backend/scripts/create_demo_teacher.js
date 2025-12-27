import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'teacher@school.com';
    const password = 'password123';
    const name = 'Sarah Teacher';

    console.log(`Setting up demo teacher: ${email}`);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        // Update existing user to ensure password is known and role is correct
        user = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: 'teacher',
                isActive: true, // Ensure active
            },
        });
        console.log('Existing user updated.');
    } else {
        // Create new user
        user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'teacher',
                isActive: true,
            },
        });
        console.log('New user created.');
    }

    // Ensure Teacher Profile Exists checks unique userId
    const teacherProfile = await prisma.teacher.findUnique({ where: { userId: user.id } });

    if (!teacherProfile) {
        // Also check employeeId uniqueness to be safe, if exists generate a random one
        const empIdCheck = await prisma.teacher.findUnique({ where: { employeeId: 'TCH-DEMO-001' } });
        const finalEmpId = empIdCheck ? `TCH-DEMO-${Math.floor(Math.random() * 1000)}` : 'TCH-DEMO-001';

        await prisma.teacher.create({
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                employeeId: finalEmpId,
                phone: '9876543210',
                subject: 'Mathematics',
                qualification: 'M.Sc Mathematics',
                experience: 5,
                status: 'active',
            },
        });
        console.log('Teacher profile created.');
    } else {
        console.log('Teacher profile already exists for this user.');
    }

    console.log('\n--- CREDENTIALS ---');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
