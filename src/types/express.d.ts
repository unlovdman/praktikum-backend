import { PrismaClient } from '@prisma/client'
import { Request } from 'express'

declare global {
  namespace Express {
    interface Request {
      db: PrismaClient
      user?: {
        id: string
        email: string
        role: string
      }
    }
  }
} 