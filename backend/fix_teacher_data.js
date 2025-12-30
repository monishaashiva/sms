import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'teacher@school.com';
    const newName = 'K R Sudha';
    const password = 'teacher123';

    console.log(`Fixing account for ${email}...`);

    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Upsert User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name: newName,
            password: hashedPassword,
            isActive: true,
            role: 'teacher'
        },
        create: {
            name: newName,
            email,
            password: hashedPassword,
            role: 'teacher',
            isActive: true
        }
    });

    console.log('User updated:', user.id);

    // 3. Update or Create Teacher Profile
    // Check if a teacher profile exists for this user
    let teacher = await prisma.teacher.findUnique({
        where: { userId: user.id } // This relies on the 1-to-1 relation
    });

    // Fallback: Check by email if userId link was missing
    if (!teacher) {
        teacher = await prisma.teacher.findUnique({
            where: { email: email }
        });
    }

    if (teacher) {
        // Update existing
        await prisma.teacher.update({
            where: { id: teacher.id },
            data: {
                name: newName,
                userId: user.id, // Ensure link
                status: 'active'
            }
        });
        console.log('Teacher profile updated.');
    } else {
        // Create new
        await prisma.teacher.create({
            data: {
                name: newName,
                email: email,
                userId: user.id,
                employeeId: 'T-SUDHA',
                phone: '9876543210',
                subject: 'Mathematics',
                qualification: 'M.Sc B.Ed',
                experience: 15,
                status: 'active'
            }
        });
        console.log('Teacher profile created.');
    }

    console.log('✅ Account Name and Password Fixed.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
