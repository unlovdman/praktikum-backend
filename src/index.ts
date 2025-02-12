import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'
import swaggerUi from 'swagger-ui-express'

// Routes
import { authRouter } from './routes/auth'
import { praktikumRouter } from './routes/praktikum'
import { asistensiRouter } from './routes/asistensi'
import { laporanRouter } from './routes/laporan'
import { nilaiRouter } from './routes/nilai'
import { periodRouter } from './routes/period'

dotenv.config()

// Create a new PrismaClient instance with logging enabled
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: "postgresql://postgres:Ymp1nkx0c97xnp6T@db.crtwwcwiokhxzjcuvkwd.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require&pool_timeout=0"
    }
  }
})

// Test database connection on startup
prisma.$connect()
  .then(() => console.log('Database connection successful'))
  .catch((error) => {
    console.error('Database connection error:', error);
    console.error('Connection URL:', process.env.DATABASE_URL);
  })

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
    },
    '/periods': {
      get: {
        tags: ['Period'],
        summary: 'Get all periods',
        responses: {
          '200': {
            description: 'List of all periods',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      startDate: { type: 'string', format: 'date-time' },
                      endDate: { type: 'string', format: 'date-time' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Period'],
        summary: 'Create a new period',
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
            description: 'Period created successfully'
          }
        }
      }
    },
    '/praktikum': {
      get: {
        tags: ['Praktikum'],
        summary: 'Get all praktikum sessions',
        responses: {
          '200': {
            description: 'List of all praktikum sessions',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      date: { type: 'string', format: 'date-time' },
                      googleFormUrl: { type: 'string' },
                      pertemuanId: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/praktikum/pertemuan/{pertemuanId}': {
      post: {
        tags: ['Praktikum'],
        summary: 'Create a praktikum session for a pertemuan',
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'date', 'googleFormUrl'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  date: { type: 'string', format: 'date-time' },
                  googleFormUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Praktikum session created successfully'
          }
        }
      }
    },
    '/asistensi/pertemuan/{pertemuanId}': {
      get: {
        tags: ['Asistensi'],
        summary: 'Get all asistensi records for a pertemuan',
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'List of asistensi records'
          }
        }
      },
      post: {
        tags: ['Asistensi'],
        summary: 'Record asistensi for a pertemuan',
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
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
            description: 'Asistensi recorded successfully'
          }
        }
      }
    },
    '/laporan/pertemuan/{pertemuanId}': {
      get: {
        tags: ['Laporan'],
        summary: 'Get all laporan records for a pertemuan',
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'List of laporan records'
          }
        }
      },
      post: {
        tags: ['Laporan'],
        summary: 'Submit laporan for a pertemuan',
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Laporan submitted successfully'
          }
        }
      }
    },
    '/nilai/pertemuan/{pertemuanId}': {
      get: {
        tags: ['Nilai'],
        summary: 'Get all nilai records for a pertemuan',
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'List of nilai records'
          }
        }
      },
      post: {
        tags: ['Nilai'],
        summary: 'Input or update nilai for a pertemuan',
        parameters: [
          {
            name: 'pertemuanId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string' },
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
            description: 'Nilai recorded successfully'
          }
        }
      }
    }
  }
}

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerDocument)
})

// Serve Swagger UI
app.get('/swagger', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Praktikum Management API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
        <style>
            body { margin: 0; }
            .swagger-ui .topbar { display: none; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = function() {
                window.ui = SwaggerUIBundle({
                    url: '/swagger.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout",
                    persistAuthorization: true
                });
            };
        </script>
    </body>
    </html>
  `
  res.setHeader('Content-Type', 'text/html')
  res.send(html)
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