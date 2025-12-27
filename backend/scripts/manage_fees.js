import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Fee Management Script ---');

    // 1. Cleanup Deleted Students
    console.log('\nScanning for fees linked to deleted students...');
    const deletedStudentFees = await prisma.fee.findMany({
        where: {
            student: {
                rollNo: {
                    contains: '_deleted_'
                }
            }
        },
        select: { id: true, student: { select: { name: true, rollNo: true } } }
    });

    if (deletedStudentFees.length > 0) {
        console.log(`Found ${deletedStudentFees.length} fees for deleted students.`);
        deletedStudentFees.forEach(f => console.log(` - Deleting fee for ${f.student.name} (${f.student.rollNo})`));

        const idsToDelete = deletedStudentFees.map(f => f.id);

        // Delete related payments first
        const deletedPayments = await prisma.feePayment.deleteMany({
            where: { feeId: { in: idsToDelete } }
        });
        console.log(` - Deleted ${deletedPayments.count} related payment records.`);

        // Delete related discounts
        const deletedDiscounts = await prisma.feeDiscount.deleteMany({
            where: { feeId: { in: idsToDelete } }
        });
        console.log(` - Deleted ${deletedDiscounts.count} related discount records.`);

        const { count } = await prisma.fee.deleteMany({
            where: {
                id: { in: idsToDelete }
            }
        });
        console.log(`Successfully deleted ${count} bad fee records.`);
    } else {
        console.log('No bad fee records found.');
    }

    // 2. Initialize Fees for All Classes
    console.log('\nInitializing fees for remaining classes...');

    // Get a reference structure from Class 9 (or any class with fees)
    const referenceFee = await prisma.fee.findFirst({
        where: {
            totalFee: { gt: 0 }
        },
        take: 1
    });

    let feeStructure = {
        tuition: 45000,
        lab: 5000,
        sports: 2000
    };
    let term = 'Term 1';
    let totalFee = 52000;
    let academicYear = '2024-2025';

    if (referenceFee && referenceFee.feeStructure) {
        console.log('Found reference fee structure from existing records.');
        feeStructure = referenceFee.feeStructure;
        term = referenceFee.term;
        totalFee = referenceFee.totalFee;
        academicYear = referenceFee.academicYear;
    } else {
        console.log('No reference found. Using defaults: Tuition 45k, Lab 5k, Sports 2k.');
    }

    // Get all classes
    const classes = await prisma.class.findMany({
        include: {
            _count: {
                select: { students: true }
            }
        }
    });

    for (const cls of classes) {
        // Check if fees already exist for this class
        const existingFees = await prisma.fee.count({
            where: { classId: cls.id }
        });

        if (existingFees > 0) {
            console.log(`Class ${cls.name} (${cls.section}) already has fees. Skipping.`);
            continue;
        }

        if (cls._count.students === 0) {
            console.log(`Class ${cls.name} (${cls.section}) has no students. Skipping.`);
            continue;
        }

        // Get active students for this class
        const students = await prisma.student.findMany({
            where: {
                classId: cls.id,
                status: { not: 'inactive' } // Ensure we don't pick up soft-deleted ones if status is set
            }
        });

        // Double check filtering for _deleted_ just in case status wasn't updated
        const activeStudents = students.filter(s => !s.rollNo.includes('_deleted_'));

        if (activeStudents.length === 0) {
            console.log(`Class ${cls.name} (${cls.section}) has no active students. Skipping.`);
            continue;
        }

        // Create fees
        const feeData = activeStudents.map(student => ({
            studentId: student.id,
            classId: cls.id,
            feeStructure: feeStructure,
            term: term,
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Due next month
            academicYear: academicYear,
            totalFee: totalFee,
            dueAmount: totalFee,
            paidAmount: 0,
            status: 'pending'
        }));

        await prisma.fee.createMany({
            data: feeData
        });

        console.log(`Initialized fees for Class ${cls.name} (${cls.section}) - ${activeStudents.length} students.`);
    }

    console.log('\n--- Script Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
