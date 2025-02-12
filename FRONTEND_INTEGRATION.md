# Frontend Integration Guide

## Base URL

```
https://praktikum-backendwir.vercel.app/
```

## Authentication

### 1. Register a New User

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'ASISTEN_LAB' | 'PRAKTIKAN';
}

// Example using fetch
const response = await fetch(`${BASE_URL}/auth/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'PRAKTIKAN'
  })
});

const data = await response.json();
// Returns: { user: User, token: string }
```

### 2. Login

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

const response = await fetch(`${BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Returns: { user: User, token: string }
```

### 3. Using Authentication Token

```typescript
// Add this header to all authenticated requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## API Endpoints

### Periods

1. Get All Periods

```typescript
const response = await fetch(`${BASE_URL}/periods`, {
  headers
});
const periods = await response.json();
```

2. Create Period (Admin only)

```typescript
interface CreatePeriodRequest {
  name: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

const response = await fetch(`${BASE_URL}/periods`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'PBO Period 2024',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z'
  })
});
```

### Praktikum

1. Get All Praktikum Sessions

```typescript
const response = await fetch(`${BASE_URL}/praktikum`, {
  headers
});
const praktikums = await response.json();
```

2. Schedule Praktikum (Admin only)

```typescript
interface CreatePraktikumRequest {
  name?: string;
  description?: string;
  date: string;        // ISO date string
  googleFormUrl: string;
}

const response = await fetch(`${BASE_URL}/praktikum/pertemuan/${pertemuanId}`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'Praktikum 1: Introduction to Java',
    description: 'Basic Java programming concepts',
    date: '2024-02-01T09:00:00Z',
    googleFormUrl: 'https://forms.google.com/...'
  })
});
```

### Asistensi

1. Record Attendance

```typescript
interface CreateAsistensiRequest {
  userId: string;
  attendance: boolean;
  score: number;
}

const response = await fetch(`${BASE_URL}/asistensi/pertemuan/${pertemuanId}`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    userId: 'user-id',
    attendance: true,
    score: 85
  })
});
```

2. Get User's Asistensi Records

```typescript
const response = await fetch(`${BASE_URL}/asistensi/user/${userId}`, {
  headers
});
const asistensiRecords = await response.json();
```

### Laporan

1. Submit Laporan

```typescript
const response = await fetch(`${BASE_URL}/laporan/pertemuan/${pertemuanId}`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    userId: 'user-id'
  })
});
```

2. Get Upcoming Deadlines

```typescript
const response = await fetch(`${BASE_URL}/laporan/deadlines/${userId}`, {
  headers
});
const deadlines = await response.json();
```

### Nilai

1. Input/Update Nilai

```typescript
interface CreateNilaiRequest {
  userId: string;
  praktikumScore?: number;
  asistensiScore?: number;
  laporanScore?: number;
}

const response = await fetch(`${BASE_URL}/nilai/pertemuan/${pertemuanId}`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    userId: 'user-id',
    praktikumScore: 85,
    asistensiScore: 90,
    laporanScore: 88
  })
});
```

2. Get User's Nilai

```typescript
const response = await fetch(`${BASE_URL}/nilai/user/${userId}`, {
  headers
});
const nilaiRecords = await response.json();
```

## Error Handling

The API returns error responses in this format:

```typescript
interface ErrorResponse {
  error: string;
}

// Example error handling
try {
  const response = await fetch(`${BASE_URL}/some-endpoint`, {
    headers
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const data = await response.json();
} catch (error) {
  console.error('API Error:', error.message);
}
```

## TypeScript Integration

1. Install types (if you're using TypeScript):

```bash
npm install @types/express @types/express-serve-static-core
```

2. Import types from the backend:

```typescript
import { 
  User,
  Period,
  Pertemuan,
  Praktikum,
  Asistensi,
  Laporan,
  Nilai
} from '../types/models';
```

## Example React Integration

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://[your-vercel-deployment-url]';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example React component
function PeriodList() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await api.get('/periods');
        setPeriods(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPeriods();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Periods</h1>
      {periods.map(period => (
        <div key={period.id}>
          <h2>{period.name}</h2>
          <p>Start Date: {new Date(period.startDate).toLocaleDateString()}</p>
          <p>End Date: {new Date(period.endDate).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

export default PeriodList;
```

## Best Practices

1. **Token Management**

   - Store the JWT token securely (e.g., in HttpOnly cookies or localStorage)
   - Implement token refresh mechanism if needed
   - Clear token on logout
2. **Error Handling**

   - Implement global error handling
   - Handle network errors gracefully
   - Show appropriate error messages to users
3. **Loading States**

   - Show loading indicators during API calls
   - Implement skeleton loading where appropriate
   - Handle loading states in UI components
4. **Data Caching**

   - Consider implementing client-side caching
   - Use React Query or SWR for data fetching
   - Cache frequently accessed data
5. **Type Safety**

   - Use TypeScript for better type safety
   - Share types between frontend and backend
   - Implement proper type checking

## Security Considerations

1. **CORS**

   - The backend is configured to accept requests from all origins
   - In production, configure specific allowed origins
2. **Token Security**

   - Never store sensitive data in localStorage
   - Consider using HttpOnly cookies for tokens
   - Implement token refresh mechanism
3. **Input Validation**

   - Validate all user inputs before sending to API
   - Sanitize data to prevent XSS attacks
   - Handle file uploads securely
4. **Error Messages**

   - Don't expose sensitive information in error messages
   - Log errors server-side for debugging
   - Show user-friendly error messages
