import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Use the connection pooler URL with SSL
process.env.DATABASE_URL = "postgresql://postgres:Ymp1nkx0c97xnp6T@db.crtwwcwiokhxzjcuvkwd.supabase.co:5432/postgres?sslmode=require&connection_limit=1&pool_timeout=0";

async function testLogin() {
  const prisma = new PrismaClient();
  console.log('Starting login test...');
  
  try {
    console.log('\n1. Testing database connection...');
    await prisma.$connect();
    console.log('✓ Database connection successful');

    const email = 'lab.rpl@itats.com';
    const password = 'labrpljayajaya';

    console.log('\n2. Finding user...');
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true
      }
    });

    if (!user) {
      console.log('✗ User not found');
      return;
    }

    console.log('✓ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      passwordHash: user.password.substring(0, 20) + '...'
    });

    console.log('\n3. Testing password...');
    console.log('Input password:', password);
    console.log('Stored hash:', user.password);
    
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', validPassword);
    
    if (!validPassword) {
      console.log('✗ Password verification failed');
      return;
    }
    console.log('✓ Password verification successful');

    console.log('\n4. Testing JWT signing...');
    const jwtSecret = process.env.JWT_SECRET || '253dacd5af0b3612ea1d45420d494ed260a9dcb93aaf9b8ac8aa1de2c51a5f6e';
    console.log('Using JWT secret:', jwtSecret.substring(0, 10) + '...');
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      jwtSecret,
      { expiresIn: '1d' }
    );
    
    console.log('✓ JWT token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');

    console.log('\n5. Testing JWT verification...');
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✓ JWT verification successful');
    console.log('Decoded token:', decoded);

    console.log('\nAll tests passed successfully! ✨');

  } catch (error) {
    console.error('\n✗ Error occurred:', error);
    if (error.code === 'P1001') {
      console.error('Database connection error. Check connection string and network.');
    } else if (error.code === 'P2021') {
      console.error('Table does not exist. Check if migrations are applied.');
    }
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin(); 