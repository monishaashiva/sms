import prisma from './config/prisma.js';

const checkEmail = async () => {
    const email = 'kushalraj@gmail.com'; // From screenshot
    console.log(`Checking for email: ${email}`);

    const students = await prisma.student.findMany({
        where: { email: { contains: 'kushal', mode: 'insensitive' } }
    });

    console.log('Found students matching "kushal":');
    for (const s of students) {
        const cls = await prisma.class.findUnique({ where: { id: s.classId } });
        console.log(`- Name: ${s.name}, Email: ${s.email}, Status: ${s.status}, Class: ${cls?.name}-${cls?.section}, RollNo: ${s.rollNo}`);
    }

    await prisma.$disconnect();
};

checkEmail();
