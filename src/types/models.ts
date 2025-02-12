import { Role } from '@prisma/client'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  createdAt: Date
  updatedAt: Date
  kelompokId?: string | null
}

export interface Period {
  id: string
  name: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface Pertemuan {
  id: string
  number: number
  periodId: string
  createdAt: Date
  updatedAt: Date
}

export interface Praktikum {
  id: string
  name: string
  description?: string | null
  date: Date
  googleFormUrl: string
  pertemuanId: string
  createdAt: Date
  updatedAt: Date
}

export interface Kelompok {
  id: string
  name: string
  praktikumId: string
  createdAt: Date
  updatedAt: Date
}

export interface Asistensi {
  id: string
  attendance: boolean
  score?: number | null
  date: Date
  userId: string
  pertemuanId: string
  createdAt: Date
  updatedAt: Date
}

export interface Laporan {
  id: string
  submittedAt: Date
  deadline: Date
  isLate: boolean
  score?: number | null
  userId: string
  pertemuanId: string
  createdAt: Date
  updatedAt: Date
}

export interface Nilai {
  id: string
  praktikumScore?: number | null
  asistensiScore?: number | null
  laporanScore?: number | null
  finalScore?: number | null
  userId: string
  pertemuanId: string
  createdAt: Date
  updatedAt: Date
}

// Request body types
export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: Role
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreatePeriodRequest {
  name: string
  startDate: string
  endDate: string
}

export interface CreatePertemuanRequest {
  number: number
}

export interface CreatePraktikumRequest {
  name?: string
  description?: string
  date: string
  googleFormUrl: string
}

export interface CreateAsistensiRequest {
  userId: string
  attendance: boolean
  score: number
}

export interface SubmitLaporanRequest {
  userId: string
}

export interface ScoreLaporanRequest {
  score: number
}

export interface CreateNilaiRequest {
  userId: string
  praktikumScore?: number
  asistensiScore?: number
  laporanScore?: number
} 