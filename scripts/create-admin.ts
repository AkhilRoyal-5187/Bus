const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('12345678', 10);
    
    const admin = await prisma.admin.create({
      data: {
        email: 'akhilroyal5187@gmail.com',
        password: hashedPassword,
        name: 'Admin User',
        mobileNo: '1234567890',
        role: 'admin'
      }
    });

    console.log('Admin created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 