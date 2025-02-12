import { PrismaClient, Role } from '@prisma/client'
import { Request } from 'express'

declare global {
  namespace Express {
    interface Request {
      db: PrismaClient
      user?: {
        id: string
        email: string
        role: Role
        name: string
      }
    }
  }
}

export interface TypedRequestBody<T> extends Request {
  body: T
}

export interface TypedRequestParams<T> extends Request {
  params: T
}

export interface TypedRequest<T, U> extends Request {
  body: T
  params: U
} 