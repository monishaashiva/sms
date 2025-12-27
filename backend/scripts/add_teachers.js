import prisma from '../config/prisma.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const addTeachers = async () => {
    try {
        console.log('👩‍🏫 Adding 5 more teachers...');

        const passwordHash = await bcrypt.hash('teacher123', 10);

        const newTeachers = [
            {
                name: 'Suresh Verma',
                subject: 'Science',
                qualification: 'M.Sc. Physics',
                experience: 8,
                gender: 'male'
            },
            {
                name: 'Anita Desai',
                subject: 'History',
                qualification: 'M.A. History',
                experience: 12,
                gender: 'female'
            },
            {
                name: 'Meena Iyer',
                subject: 'Geography',
                qualification: 'M.A. Geography',
                experience: 5,
                gender: 'female'
            },
            {
                name: 'Vikram Singh',
                subject: 'Computer Science',
                qualification: 'M.C.A.',
                experience: 6,
                gender: 'male'
            },
            {
                name: 'Pooja Malhotra',
                subject: 'Art',
                qualification: 'B.F.A.',
                experience: 4,
                gender: 'female'
            }
        ];

        for (const t of newTeachers) {
            // Create User first
            const email = `${t.name.toLowerCase().replace(' ', '.')}@schoolharmony.edu`;

            const user = await prisma.user.create({
                data: {
                    name: t.name,
                    email,
                    password: passwordHash,
                    role: 'teacher',
                    phone: `98${Math.floor(Math.random() * 100000000)}`
                }
            });

            // Create Teacher profile
            await prisma.teacher.create({
                data: {
                    userId: user.id,
                    name: t.name,
                    email,
                    employeeId: `T${Math.floor(1000 + Math.random() * 9000)}`, // Random 4 digit ID
                    phone: user.phone,
                    subject: t.subject,
                    qualification: t.qualification,
                    experience: t.experience,
                    dateOfJoining: new Date(),
                    status: 'active'
                }
            });

            console.log(`✅ Added ${t.name} (${t.subject})`);
        }

        console.log('✨ Successfully added 5 teachers.');

    } catch (error) {
        console.error('Error adding teachers:', error);
    } finally {
        await prisma.$disconnect();
    }
};

addTeachers();
