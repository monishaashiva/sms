import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'sudha@school.com';
    console.log(`Checking data for: ${email}`);

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error('User not found!');
        return;
    }
    console.log(`User Found: ID=${user.id}, Role=${user.role}`);

    // 2. Find Teacher Profile by userId
    let teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        include: { classes: true, teachingClasses: true }
    });

    if (!teacher) {
        console.log('Teacher profile not linked by userId! Attempting to fix...');
        // Try to find by email
        teacher = await prisma.teacher.findFirst({ where: { email } });
        if (teacher) {
            await prisma.teacher.update({
                where: { id: teacher.id },
                data: { userId: user.id }
            });
            console.log('Fixed: Linked User to Teacher Profile.');
        } else {
            console.error('No Teacher profile found matching email!');
            return;
        }
    } else {
        console.log('Teacher Profile Linked OK.');
    }

    // 3. Assign Classes (if none)
    if (teacher.classes.length === 0) {
        console.log('No Class Teacher duties. Assigning "Class 10 A"...');
        const class10A = await prisma.class.findFirst({ where: { name: 'Class 10', section: 'A' } });

        if (class10A) {
            await prisma.teacher.update({
                where: { id: teacher.id },
                data: {
                    classes: { connect: { id: class10A.id } }
                }
            });
            console.log('Assigned Class 10 A as Class Teacher.');
        } else {
            // Create Class 10 A if missing
            const newClass = await prisma.class.create({
                data: {
                    name: 'Class 10',
                    grade: 10,
                    section: 'A',
                    academicYear: '2024-2025',
                    classTeacherId: teacher.id
                }
            });
            console.log('Created and Assigned Class 10 A.');
        }
    }

    // 4. Assign Subject Classes
    if (teacher.teachingClasses.length === 0) {
        console.log('No Subject Classes. Assigning "Class 9 B"...');
        const class9B = await prisma.class.findFirst({ where: { name: 'Class 9', section: 'B' } });
        if (class9B) {
            await prisma.teacher.update({
                where: { id: teacher.id },
                data: {
                    teachingClasses: { connect: { id: class9B.id } }
                }
            });
            console.log('Assigned Class 9 B as Subject Teacher.');
        }
    }

    console.log('Data seeding complete. Dashboard should now populate.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
