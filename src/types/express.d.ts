import { PrismaClient, Role } from '@prisma/client'
import { Request, ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'

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

export interface TypedRequestBody<T> extends Request<ParamsDictionary, any, T, ParsedQs> {
  body: T
}

export interface TypedRequestParams<T extends ParamsDictionary> extends Request<T, any, any, ParsedQs> {
  params: T
}

export interface TypedRequest<T, U extends ParamsDictionary> extends Request<U, any, T, ParsedQs> {
  body: T
  params: U
} 