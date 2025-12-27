import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'sudha@school.com';
    const password = 'password123';

    console.log(`Resetting password for: ${email}`);

    // 1. Hash with same salt rounds as authController (10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Update User
    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: 'teacher',
                isActive: true
            }
        });
        console.log('User updated successfully.');

        // 3. Verify immediately
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Verification Check: ${isMatch ? 'PASSED' : 'FAILED'}`);

    } catch (err) {
        console.error('Error updating user:', err);
    }

}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
