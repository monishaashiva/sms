import prisma from './config/prisma.js';

const fixData = async () => {
    console.log('Starting SAFE data fix...');

    try {
        const classes = await prisma.class.findMany();
        console.log(`Found ${classes.length} classes.`);

        for (const cls of classes) {
            const students = await prisma.student.findMany({
                where: {
                    classId: cls.id,
                    status: 'active'
                },
                orderBy: { name: 'asc' },
                select: { id: true, name: true, rollNo: true }
            });

            if (students.length === 0) continue;

            console.log(`Processing Class: ${cls.name} (${students.length} students)`);

            // PHASE 1: Reset ALL to unique Temp
            console.log('  Phase 1: Resetting to TEMP...');
            for (let i = 0; i < students.length; i++) {
                await prisma.student.update({
                    where: { id: students[i].id },
                    data: { rollNo: `FIX_TEMP_${cls.id}_${i}_${Date.now()}` }
                });
            }

            // PHASE 2: Set to Sequential
            console.log('  Phase 2: Assigning Sequential 1, 2, 3...');
            for (let i = 0; i < students.length; i++) {
                const newRollNo = (i + 1).toString();
                await prisma.student.update({
                    where: { id: students[i].id },
                    data: { rollNo: newRollNo }
                });
                console.log(`    ${students[i].name} -> ${newRollNo}`);
            }
        }
        console.log('Data fix completed successfully!');
    } catch (error) {
        console.error('Error fixing data:', error);
    } finally {
        await prisma.$disconnect();
    }
};

fixData();
