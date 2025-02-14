import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('Environment variables:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));
  console.log('DIRECT_URL:', process.env.DIRECT_URL?.replace(/:[^:@]*@/, ':****@'));
  
  try {
    console.log('\nTesting database connection...');
    await prisma.$connect();
    console.log('✓ Database connection successful');

    console.log('\nTesting query...');
    const userCount = await prisma.user.count();
    console.log('✓ Query successful - User count:', userCount);

    console.log('\nTesting user fetch...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      }
    });
    console.log('✓ Users found:', users);

  } catch (error) {
    console.error('Error occurred:', error);
    if (error.code === 'P1001') {
      console.error('Could not connect to database. Check connection string and network.');
    } else if (error.code === 'P2021') {
      console.error('Table does not exist. Check if migrations are applied.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 