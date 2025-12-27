import prisma from './config/prisma.js';

const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Academic year starts in April (month 3)
    if (month >= 3) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

async function checkDashboard() {
    try {
        const academicYear = getCurrentAcademicYear();
        console.log('Calculated Academic Year:', academicYear);

        const feeRecords = await prisma.fee.findMany({ where: { academicYear } });
        console.log(`Found ${feeRecords.length} fee records for ${academicYear}`);

        if (feeRecords.length > 0) {
            console.log('First 3 records:', feeRecords.slice(0, 3).map(f => ({
                id: f.id,
                year: f.academicYear,
                paid: f.paidAmount
            })));
        }

        const feesCollected = feeRecords.reduce((sum, fee) => sum + fee.paidAmount, 0);
        console.log('Calculated Fees Collected:', feesCollected);

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDashboard();
