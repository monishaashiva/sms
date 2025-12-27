import prisma from './config/prisma.js';

const fixTeacherData = async () => {
    console.log('Starting SAFE Teacher data fix...');

    try {
        // 1. Fix Inactive Teachers (renaming unique fields)
        const inactiveTeachers = await prisma.teacher.findMany({
            where: {
                status: 'inactive',
                NOT: {
                    email: { contains: '_deleted_' }
                }
            }
        });

        console.log(`Found ${inactiveTeachers.length} inactive teachers to rename.`);

        for (const t of inactiveTeachers) {
            const suffix = `_deleted_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            try {
                await prisma.teacher.update({
                    where: { id: t.id },
                    data: {
                        email: `${t.email}${suffix}`,
                        employeeId: `${t.employeeId}${suffix}`
                    }
                });
                console.log(`Renamed inactive teacher: ${t.name}`);
            } catch (e) {
                console.error(`Failed to rename ${t.name}:`, e.message);
            }
        }

        console.log('Teacher data fix completed successfully!');
    } catch (error) {
        console.error('Error fixing teacher data:', error);
    } finally {
        await prisma.$disconnect();
    }
};

fixTeacherData();
