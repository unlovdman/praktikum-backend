import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import swaggerUi from 'swagger-ui-express'
import * as dotenv from 'dotenv'
import path from 'path'

// Routes
import { authRouter } from './routes/auth'
import { praktikumRouter } from './routes/praktikum'
import { asistensiRouter } from './routes/asistensi'
import { laporanRouter } from './routes/laporan'
import { nilaiRouter } from './routes/nilai'
import { periodRouter } from './routes/period'

dotenv.config()

const prisma = new PrismaClient()
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Praktikum Management API',
    version: '1.0.0',
    description: 'API for managing praktikum sessions, attendance, and grading'
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://praktikum-backendwir.vercel.app'
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Period', description: 'Period management endpoints' },
    { name: 'Praktikum', description: 'Praktikum session endpoints' },
    { name: 'Asistensi', description: 'Assistance session endpoints' },
    { name: 'Laporan', description: 'Report submission endpoints' },
    { name: 'Nilai', description: 'Grading endpoints' }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  role: { type: 'string', enum: ['ADMIN', 'ASISTEN_LAB', 'PRAKTIKAN'] }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' }
                      }
                    },
                    token: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' }
                      }
                    },
                    token: { type: 'string' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Swagger setup
app.use('/swagger', swaggerUi.serve)
app.use('/swagger', swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Praktikum Management API Documentation",
  swaggerOptions: {
    url: '/swagger.json',
    persistAuthorization: true
  }
}))

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerDocument)
})

// Inject Prisma into request
app.use((req: any, res, next) => {
  req.db = prisma
  next()
})

// Routes
app.use('/auth', authRouter)
app.use('/praktikum', praktikumRouter)
app.use('/asistensi', asistensiRouter)
app.use('/laporan', laporanRouter)
app.use('/nilai', nilaiRouter)
app.use('/periods', periodRouter)

// Root endpoint
app.get('/', (req, res) => {
  res.send('Praktikum Management API is running! 🚀')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`)
  console.log(`📚 Swagger documentation available at http://localhost:${PORT}/swagger`)
})

export default app 