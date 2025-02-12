import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Override DATABASE_URL with correct port for direct database access
process.env.DATABASE_URL = "postgresql://postgres:Ymp1nkx0c97xnp6T@db.crtwwcwiokhxzjcuvkwd.supabase.co:5432/postgres";

async function createAdmin() {
  const prisma = new PrismaClient();
  console.log('Connecting to database...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin.rpl@itats.com' }
    });

    if (existingUser) {
      console.log('User already exists:', {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
      return;
    }

    // Create new user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('labrpljayajaya', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'RPL Admin',
        email: 'admin.rpl@itats.com',
        password: hashedPassword,
        role: Role.ADMIN
      }
    });

    console.log('Admin created successfully:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Error details:', error);
    if (error.code === 'P1001') {
      console.error('Could not connect to database. Check your connection string.');
    } else if (error.code === 'P2002') {
      console.error('User with this email already exists.');
    } else {
      console.error('Unexpected error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 