import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Override DATABASE_URL with correct port for direct database access
process.env.DATABASE_URL = "postgresql://postgres:Ymp1nkx0c97xnp6T@db.crtwwcwiokhxzjcuvkwd.supabase.co:5432/postgres";

async function checkUser() {
  const prisma = new PrismaClient();
  console.log('Connecting to database...');
  
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: 'admin.rpl@itats.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', {
      ...user,
      password: user.password.substring(0, 20) + '...' // Only show part of the hash for security
    });

    // Test password
    const testPassword = 'labrpljayajaya';
    const passwordMatch = await bcrypt.compare(testPassword, user.password);
    console.log('\nPassword test:', {
      testPassword,
      passwordMatches: passwordMatch
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 