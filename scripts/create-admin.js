const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const prisma = new PrismaClient();
  try {
    const hashedPassword = await bcrypt.hash('labrpljayajaya', 10);
    const user = await prisma.user.create({
      data: {
        name: 'RPL Admin',
        email: 'admin.rpl@itats.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Admin created successfully:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 