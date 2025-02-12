import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role, PrismaClient, Prisma } from '@prisma/client';
import { TypedRequestBody } from '../types/express';
import { RegisterRequest, LoginRequest, User } from '../types/models';

const router = Router();

// Create a new PrismaClient instance with logging enabled
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: "postgresql://postgres:Ymp1nkx0c97xnp6T@db.crtwwcwiokhxzjcuvkwd.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require&pool_timeout=0"
    }
  }
});

// Ensure database connection on startup
prisma.$connect()
  .then(() => console.log('Auth route: Database connection successful'))
  .catch((error) => {
    console.error('Auth route: Database connection error:', error);
  });

// Register endpoint
router.post('/register', async (req: TypedRequestBody<RegisterRequest>, res: Response) => {
  try {
    console.log('Starting registration process...');
    const { name, email, password, role } = req.body;

    // Test connection before proceeding
    try {
      await prisma.$connect();
      console.log('Database connected for registration');
    } catch (error) {
      console.error('Database connection error during registration:', error);
      return res.status(500).json({ error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || '253dacd5af0b3612ea1d45420d494ed260a9dcb93aaf9b8ac8aa1de2c51a5f6e',
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Login endpoint
router.post('/login', async (req: TypedRequestBody<LoginRequest>, res: Response) => {
  console.log('Starting login process...');
  
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    // Test connection before proceeding
    try {
      await prisma.$connect();
      console.log('Database connected for login');
    } catch (error) {
      console.error('Database connection error during login:', error);
      return res.status(500).json({ error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Find user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true
        }
      });
      console.log('User query result:', user ? 'User found' : 'User not found');
    } catch (error) {
      console.error('User query error:', error);
      return res.status(500).json({ error: 'Error finding user', details: error instanceof Error ? error.message : 'Unknown error' });
    }

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    // Verify password
    let validPassword;
    try {
      validPassword = await bcrypt.compare(password, user.password);
      console.log('Password validation result:', validPassword);
    } catch (error) {
      console.error('bcrypt error:', error);
      return res.status(500).json({ error: 'Error validating password', details: error instanceof Error ? error.message : 'Unknown error' });
    }

    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    try {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET || '253dacd5af0b3612ea1d45420d494ed260a9dcb93aaf9b8ac8aa1de2c51a5f6e',
        { expiresIn: '1d' }
      );
      console.log('JWT token generated successfully');

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('JWT error:', error);
      return res.status(500).json({ error: 'Error generating token', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export const authRouter = router; 