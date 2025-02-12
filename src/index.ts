import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import swaggerUi from 'swagger-ui-express'
import * as dotenv from 'dotenv'

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
    description: `
# Praktikum Management System API

This API manages the entire flow of praktikum sessions, from scheduling to grading.

## Key Concepts

1. **Period**: A semester or time period containing multiple praktikum sessions
2. **Pertemuan**: A specific meeting/session within a period
3. **Praktikum**: The actual practical session details for a pertemuan
4. **Asistensi**: Assistance sessions following each praktikum
5. **Laporan**: Lab reports submitted by students
6. **Nilai**: Scores for praktikum, asistensi, and laporan

## Authentication

All endpoints except /auth/* require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## User Roles

- ADMIN: Can manage all resources
- ASISTEN_LAB: Can manage asistensi, laporan scores, and nilai
- PRAKTIKAN: Regular student user
`
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { 
            type: 'string', 
            enum: ['ADMIN', 'ASISTEN_LAB', 'PRAKTIKAN'],
            example: 'PRAKTIKAN'
          }
        }
      },
      Period: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'PBO Periode X' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        }
      },
      Pertemuan: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          number: { type: 'integer', example: 1, description: 'Meeting number in sequence' },
          periodId: { type: 'string', format: 'uuid' }
        }
      },
      Praktikum: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Praktikum PBO Pertemuan 1' },
          description: { type: 'string', example: 'Introduction to Java OOP' },
          date: { type: 'string', format: 'date-time' },
          googleFormUrl: { type: 'string', format: 'uri', example: 'https://forms.google.com/...' },
          pertemuanId: { type: 'string', format: 'uuid' }
        }
      },
      Asistensi: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          pertemuanId: { type: 'string', format: 'uuid' },
          attendance: { type: 'boolean', example: true },
          score: { type: 'number', format: 'float', example: 85.5 },
          date: { type: 'string', format: 'date-time' }
        }
      },
      Laporan: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          pertemuanId: { type: 'string', format: 'uuid' },
          submittedAt: { type: 'string', format: 'date-time' },
          deadline: { type: 'string', format: 'date-time' },
          isLate: { type: 'boolean', example: false },
          score: { type: 'number', format: 'float', example: 90.0 }
        }
      },
      Nilai: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          pertemuanId: { type: 'string', format: 'uuid' },
          praktikumScore: { type: 'number', format: 'float', example: 85.0 },
          asistensiScore: { type: 'number', format: 'float', example: 90.0 },
          laporanScore: { type: 'number', format: 'float', example: 88.0 },
          finalScore: { 
            type: 'number', 
            format: 'float', 
            example: 87.4,
            description: 'Weighted average: 40% praktikum + 30% asistensi + 30% laporan'
          }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
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
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' }
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
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
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
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/periods': {
      get: {
        tags: ['Period'],
        summary: 'Get all periods',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of periods',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Period' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Period'],
        summary: 'Create new period',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'startDate', 'endDate'],
                properties: {
                  name: { type: 'string' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Period created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Period' }
              }
            }
          }
        }
      }
    },
    '/periods/{periodId}/pertemuan': {
      get: {
        tags: ['Pertemuan'],
        summary: 'Get all pertemuan for a period',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'periodId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of pertemuan',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Pertemuan' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Pertemuan'],
        summary: 'Create new pertemuan',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'periodId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['number'],
                properties: {
                  number: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Pertemuan created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pertemuan' }
              }
            }
          }
        }
      }
    },
    '/pertemuan/{pertemuanId}/praktikum': {
      post: {
        tags: ['Praktikum'],
        summary: 'Schedule praktikum session for a pertemuan',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'date'],
                properties: {
                  name: { type: 'string', example: 'Praktikum PBO Pertemuan 1' },
                  description: { type: 'string' },
                  date: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Praktikum scheduled successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Praktikum' }
              }
            }
          }
        }
      }
    },
    '/pertemuan/{pertemuanId}/asistensi': {
      post: {
        tags: ['Asistensi'],
        summary: 'Record asistensi for a pertemuan',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'attendance'],
                properties: {
                  userId: { type: 'string' },
                  attendance: { type: 'boolean' },
                  score: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Asistensi recorded successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Asistensi' }
              }
            }
          }
        }
      }
    },
    '/laporan': {
      get: {
        tags: ['Laporan'],
        summary: 'Get all laporan records',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of laporan records',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Laporan' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Laporan'],
        summary: 'Submit new laporan',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'praktikumId', 'googleFormUrl'],
                properties: {
                  userId: { type: 'string' },
                  praktikumId: { type: 'string' },
                  googleFormUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Laporan submitted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Laporan' }
              }
            }
          }
        }
      }
    },
    '/nilai': {
      get: {
        tags: ['Nilai'],
        summary: 'Get all nilai records',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of nilai records',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Nilai' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Nilai'],
        summary: 'Input new nilai',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'praktikumId'],
                properties: {
                  userId: { type: 'string' },
                  praktikumId: { type: 'string' },
                  praktikumScore: { type: 'number' },
                  asistensiScore: { type: 'number' },
                  laporanScore: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Nilai recorded successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Nilai' }
              }
            }
          }
        }
      }
    },
    '/laporan/pertemuan/{pertemuanId}': {
      post: {
        tags: ['Laporan'],
        summary: 'Submit laporan for a pertemuan (deadline is next pertemuan date)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'googleFormUrl'],
                properties: {
                  userId: { type: 'string' },
                  googleFormUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Laporan submitted successfully',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/Laporan' },
                    {
                      type: 'object',
                      properties: {
                        laporan: { $ref: '#/components/schemas/Laporan' },
                        warning: { 
                          type: 'string',
                          example: 'Laporan was submitted after the deadline. This may affect your score.'
                        }
                      }
                    }
                  ]
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
                    error: { 
                      type: 'string',
                      example: 'Cannot submit laporan yet. Next pertemuan must be scheduled first to set the deadline.'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/laporan/deadlines/{userId}': {
      get: {
        tags: ['Laporan'],
        summary: 'Get upcoming laporan deadlines for a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of upcoming deadlines',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      pertemuanId: { type: 'string' },
                      pertemuanNumber: { type: 'integer' },
                      periodName: { type: 'string' },
                      praktikumDate: { type: 'string', format: 'date-time' },
                      deadline: { type: 'string', format: 'date-time' },
                      hasSubmitted: { type: 'boolean' },
                      isLate: { type: 'boolean' }
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
}

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

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