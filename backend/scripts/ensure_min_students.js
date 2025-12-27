import prisma from '../config/prisma.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config();

const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Ananya', 'Diya', 'Saanvi', 'Kiara', 'Myra', 'Aadhya', 'Pari', 'Riya', 'Aditi', 'Zara'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Patel', 'Joshi', 'Mehta', 'Chopra', 'Saxena', 'Iyer'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateName = () => `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;

const reassignRollNumbers = async (classId) => {
    const students = await prisma.student.findMany({
        where: { classId, status: 'active' },
        orderBy: { name: 'asc' },
        select: { id: true }
    });

    // Pass 1: Set to temporary safe values
    const timestamp = Date.now();
    for (let i = 0; i < students.length; i++) {
        await prisma.student.update({
            where: { id: students[i].id },
            data: { rollNo: `SORT_TEMP_${timestamp}_${i}` }
        });
    }

    // Pass 2: Set to real sequential values
    for (let i = 0; i < students.length; i++) {
        await prisma.student.update({
            where: { id: students[i].id },
            data: { rollNo: (i + 1).toString() }
        });
    }
};

const ensureMinStudents = async () => {
    try {
        console.log('🔍 Checking classes for minimum student count (5)...');

        const classes = await prisma.class.findMany({
            include: {
                _count: {
                    select: { students: true } // Assuming 'students' relation exists and counts all (including inactive? maybe filter)
                }
            }
        });

        // Actually, let's just fetch active students count manually per class to be safe about 'status'.
        // Or just fetch all classes and loop.

        const allClasses = await prisma.class.findMany();
        const passwordHash = await bcrypt.hash('123456', 10);

        for (const cls of allClasses) {
            const studentCount = await prisma.student.count({
                where: { classId: cls.id, status: 'active' }
            });

            if (studentCount < 5) {
                const needed = 5 - studentCount;
                console.log(`⚠️  ${cls.name} has ${studentCount} students. Adding ${needed} more...`);

                for (let i = 0; i < needed; i++) {
                    const name = generateName();
                    const cleanName = name.toLowerCase().replace(/\s+/g, '.');
                    const randomNum = Math.floor(Math.random() * 10000);
                    const email = `${cleanName}.${randomNum}@schoolharmony.edu`;

                    // Random gender
                    const gender = Math.random() > 0.5 ? 'male' : 'female';

                    await prisma.student.create({
                        data: {
                            name,
                            email,
                            rollNo: `TEMP_${Date.now()}_${i}`,
                            classId: cls.id,
                            section: cls.section,
                            phone: '9876543210', // Dummy
                            dateOfBirth: new Date(2010, 0, 1),
                            gender,
                            status: 'active',
                            fatherName: `${getRandomElement(firstNames)} ${name.split(' ')[1]}`,
                            motherName: `${getRandomElement(firstNames)} ${name.split(' ')[1]}`,
                            guardianPhone: '9876543210'
                        }
                    });
                }

                // Reassign roll numbers
                await reassignRollNumbers(cls.id);
                console.log(`✅ Added students to ${cls.name} and reordered roll numbers.`);
            } else {
                console.log(`✓ ${cls.name} has ${studentCount} students. No action needed.`);
            }
        }

        console.log('✨ Requirement satisfied: All classes have at least 5 students.');

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

ensureMinStudents();
