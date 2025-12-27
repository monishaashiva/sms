import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const teachers = await prisma.teacher.findMany({
        select: { name: true, email: true, employeeId: true }
    });

    console.log('--- Existing Teachers ---');
    if (teachers.length === 0) {
        console.log('No teachers found.');
    }
    teachers.forEach(t => {
        console.log(`Name: ${t.name} | Email: ${t.email}`);
    });
    console.log('-------------------------');
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
