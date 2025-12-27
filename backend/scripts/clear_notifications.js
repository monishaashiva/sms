import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing notifications...');
    try {
        // Delete NotificationRead first due to foreign key constraints
        await prisma.notificationRead.deleteMany({});
        console.log('Deleted NotificationRead records.');

        // Delete Notifications
        await prisma.notification.deleteMany({});
        console.log('Deleted Notification records.');

        console.log('All notifications cleared successfully.');
    } catch (error) {
        console.error('Error clearing notifications:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
