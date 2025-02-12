import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use the Supabase connection pooler URL
process.env.DATABASE_URL = "postgresql://postgres:Ymp1nkx0c97xnp6T@db.crtwwcwiokhxzjcuvkwd.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1";

async function testVercelEnv() {
  const prisma = new PrismaClient();
  console.log('Testing Vercel environment...');
  
  try {
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✓ Database connection successful');

    console.log('\n2. Testing user query...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin.rpl@itats.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
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
      passwordLength: user.password.length
    });

    console.log('\n3. Testing bcrypt...');
    const testPassword = 'labrpljayajaya';
    console.log('Password to test:', testPassword);
    console.log('Stored hash:', user.password);
    
    const validPassword = await bcrypt.compare(testPassword, user.password);
    console.log('Password match result:', validPassword);
    console.log(validPassword ? '✓ Password verification successful' : '✗ Password verification failed');

    console.log('\n4. Testing JWT signing...');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );
    console.log('✓ JWT signing successful');
    console.log('Token preview:', token.substring(0, 50) + '...');

  } catch (error) {
    console.error('\n✗ Error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVercelEnv(); 