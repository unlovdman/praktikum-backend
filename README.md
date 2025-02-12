# Praktikum Management System Backend

This is the backend service for the Praktikum Management System, built with Elysia.js, PostgreSQL, and Prisma.

## Features

- Multi-role authentication (Admin, Asisten Lab, Praktikan)
- Period management for different praktikum sessions
- Praktikum session management
- Attendance and scoring system
- Report submission via Google Form integration
- Comprehensive API documentation with Swagger

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Vercel account (for deployment)

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and update the variables:
```bash
cp .env.example .env
```

4. Set up your database URL in `.env`

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

## Development

Run the development server:
```bash
npm run dev
```

The server will start at http://localhost:3000

Access the Swagger documentation at http://localhost:3000/swagger

## Database Management

View and manage your database with Prisma Studio:
```bash
npm run prisma:studio
```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set up environment variables in Vercel:
- Go to your project settings in Vercel
- Add the following environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`

5. Connect to your PostgreSQL database:
- Use Neon (https://neon.tech) or Supabase (https://supabase.com) for serverless PostgreSQL
- Update the `DATABASE_URL` in Vercel with your serverless database URL

## API Documentation

The API documentation is available at `/swagger` when the server is running. It includes:

- Authentication endpoints
- Period management
- Praktikum management
- Asistensi management
- Laporan management
- Nilai management

## Project Structure

```
src/
├── index.ts          # Main application file
├── routes/           # API routes
│   ├── auth.ts       # Authentication routes
│   ├── period.ts     # Period management routes
│   ├── praktikum.ts  # Praktikum management routes
│   ├── asistensi.ts  # Asistensi management routes
│   ├── laporan.ts    # Laporan management routes
│   └── nilai.ts      # Nilai management routes
└── middleware/       # Middleware functions
    └── auth.ts       # Authentication middleware
```

## License

ISC 