import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { TypedRequestBody } from '../types/express';
import { RegisterRequest, LoginRequest, User } from '../types/models';

const router = Router();

// Register endpoint
router.post('/register', async (req: TypedRequestBody<RegisterRequest>, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await req.db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await req.db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req: TypedRequestBody<LoginRequest>, res: Response) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    // Test database connection
    try {
      await req.db.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Find user
    let user;
    try {
      user = await req.db.user.findUnique({
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
    } catch (queryError) {
      console.error('User query error:', queryError);
      return res.status(500).json({ error: 'Error finding user' });
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
    } catch (bcryptError) {
      console.error('bcrypt error:', bcryptError);
      return res.status(500).json({ error: 'Error validating password' });
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
    } catch (jwtError) {
      console.error('JWT error:', jwtError);
      return res.status(500).json({ error: 'Error generating token' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const authRouter = router; 