import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Find an admin user to be the creator
    const admin = await prisma.user.findFirst({
        where: { role: 'admin' }
    });

    if (!admin) {
        console.log('No admin found, cannot create notification.');
        return;
    }

    const notification = await prisma.notification.create({
        data: {
            title: 'Class 10th Board Exam Timetable Released',
            message: 'The official timetable for the Class 10th Board Exams has been released. Exams commence on March 15th, 2026. Please visit the school website to download the detailed schedule. Ensure your ward is well-prepared.',
            type: 'academic',
            recipients: 'parents',
            date: new Date(),
            isActive: true,
            createdById: admin.id
        }
    });

    console.log('Notification created:', notification);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
