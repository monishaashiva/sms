import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        // Query to list all tables in the public schema of PostgreSQL
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;

        console.log('--- Database Tables ---');
        console.table(tables);
        console.log('Total tables:', tables.length);
    } catch (error) {
        console.error('Error fetching tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
