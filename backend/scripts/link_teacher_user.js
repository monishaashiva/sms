import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const targetEmail = 'sudha@school.com';
    const targetName = 'Sudha K R';
    const defaultPassword = 'password123';

    console.log(`Configuring login for: ${targetName} (${targetEmail})`);

    // 1. Find the Teacher Profile
    const teacher = await prisma.teacher.findFirst({
        where: { email: targetEmail }
    });

    if (!teacher) {
        console.error('Teacher profile not found!');
        return;
    }
    console.log('Found Teacher Profile.');

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // 3. Find or Create User
    let user = await prisma.user.findUnique({ where: { email: targetEmail } });

    if (user) {
        console.log('User account exists. Updating password and linking...');
        user = await prisma.user.update({
            where: { email: targetEmail },
            data: {
                password: hashedPassword,
                role: 'teacher',
                isActive: true, // Ensure they can login
            }
        });
    } else {
        console.log('User account missing. Creating new User account...');
        user = await prisma.user.create({
            data: {
                name: targetName,
                email: targetEmail,
                password: hashedPassword,
                role: 'teacher',
                isActive: true,
            }
        });
    }

    // 4. Link Teacher to User
    if (teacher.userId !== user.id) {
        console.log('Linking Teacher profile to User ID...');
        // We need to handle potential unique constraint if user.id is already on another teacher (unlikely here)
        await prisma.teacher.update({
            where: { id: teacher.id },
            data: { userId: user.id }
        });
        console.log('Linked successfully.');
    } else {
        console.log('Already linked correctly.');
    }

    console.log('\n--- LOGIN DETAILS ---');
    console.log(`Email:    ${targetEmail}`);
    console.log(`Password: ${defaultPassword}`);
    console.log('---------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
