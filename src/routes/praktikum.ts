import { Router, Response } from 'express'
import { adminOnly, authMiddleware } from '../middleware/auth'
import { TypedRequestBody, TypedRequestParams, TypedRequest } from '../types/express'
import { CreatePraktikumRequest } from '../types/models'
import { Request, ParamsDictionary } from 'express-serve-static-core'

const router = Router()

interface PraktikumParams extends ParamsDictionary {
  id: string;
}

interface PertemuanParams extends ParamsDictionary {
  pertemuanId: string;
}

interface PeriodParams extends ParamsDictionary {
  periodId: string;
}

// Get all praktikum sessions
router.get('/', authMiddleware, async (req: Request & { db: any }, res: Response) => {
  try {
    const praktikums = await req.db.praktikum.findMany({
      include: {
        pertemuan: {
          include: {
            period: true
          }
        },
        kelompok: {
          include: {
            members: true
          }
        }
      }
    })
    res.json(praktikums)
  } catch (error) {
    console.error('Get praktikums error:', error);
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get praktikum by ID
router.get('/:id', authMiddleware, async (req: Request & { db: any, params: PraktikumParams }, res: Response) => {
  try {
    const { id } = req.params
    const praktikum = await req.db.praktikum.findUnique({
      where: { id },
      include: {
        pertemuan: {
          include: {
            period: true
          }
        },
        kelompok: {
          include: {
            members: true
          }
        }
      }
    })
    if (!praktikum) {
      return res.status(404).json({ error: 'Praktikum not found' })
    }
    res.json(praktikum)
  } catch (error) {
    console.error('Get praktikum error:', error);
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get praktikum by period
router.get('/period/:periodId', authMiddleware, async (req: Request & { db: any, params: PeriodParams }, res: Response) => {
  try {
    const { periodId } = req.params
    const praktikums = await req.db.praktikum.findMany({
      where: { periodId },
      include: {
        period: true,
        kelompok: {
          include: {
            members: true
          }
        }
      }
    })
    res.json(praktikums)
  } catch (error) {
    console.error('Get praktikum by period error:', error);
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get praktikum by pertemuan ID
router.get('/pertemuan/:pertemuanId', authMiddleware, async (req: Request & { db: any, params: PertemuanParams }, res: Response) => {
  try {
    const { pertemuanId } = req.params
    const praktikum = await req.db.praktikum.findUnique({
      where: { pertemuanId },
      include: {
        pertemuan: {
          include: {
            period: true
          }
        },
        kelompok: {
          include: {
            members: true
          }
        }
      }
    })
    if (!praktikum) {
      return res.status(404).json({ error: 'Praktikum not found' })
    }
    res.json(praktikum)
  } catch (error) {
    console.error('Get praktikum by pertemuan error:', error);
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Schedule praktikum for a pertemuan (admin only)
router.post('/pertemuan/:pertemuanId', adminOnly, async (req: Request & { db: any, body: CreatePraktikumRequest, params: PertemuanParams }, res: Response) => {
  try {
    const { pertemuanId } = req.params
    const { name, description, date, googleFormUrl } = req.body

    if (!googleFormUrl) {
      return res.status(400).json({ error: 'Google Form URL is required for laporan submissions' })
    }

    // Validate Google Form URL format
    try {
      new URL(googleFormUrl)
    } catch (e) {
      return res.status(400).json({ error: 'Invalid Google Form URL format' })
    }

    // Check if praktikum already exists for this pertemuan
    const existingPraktikum = await req.db.praktikum.findUnique({
      where: { pertemuanId }
    })

    if (existingPraktikum) {
      return res.status(400).json({ error: 'Praktikum already exists for this pertemuan' })
    }

    // Get pertemuan to include its number in the praktikum name if not provided
    const pertemuan = await req.db.pertemuan.findUnique({
      where: { id: pertemuanId },
      include: {
        period: true
      }
    })

    if (!pertemuan) {
      return res.status(404).json({ error: 'Pertemuan not found' })
    }

    // If name is not provided, generate it from period name and pertemuan number
    const praktikumName = name || `${pertemuan.period.name} Pertemuan ${pertemuan.number}`

    const praktikum = await req.db.praktikum.create({
      data: {
        name: praktikumName,
        description,
        date: new Date(date),
        googleFormUrl,
        pertemuanId
      },
      include: {
        pertemuan: {
          include: {
            period: true
          }
        }
      }
    })
    res.status(201).json(praktikum)
  } catch (error) {
    console.error('Create praktikum error:', error);
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update praktikum (admin only)
router.put('/:id', adminOnly, async (req: Request & { db: any, body: CreatePraktikumRequest, params: PraktikumParams }, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, date, googleFormUrl } = req.body

    if (googleFormUrl) {
      // Validate Google Form URL format if provided
      try {
        new URL(googleFormUrl)
      } catch (e) {
        return res.status(400).json({ error: 'Invalid Google Form URL format' })
      }
    }

    const praktikum = await req.db.praktikum.update({
      where: { id },
      data: {
        name,
        description,
        date: new Date(date),
        ...(googleFormUrl && { googleFormUrl })
      },
      include: {
        pertemuan: {
          include: {
            period: true
          }
        }
      }
    })
    res.json(praktikum)
  } catch (error) {
    console.error('Update praktikum error:', error);
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete praktikum (admin only)
router.delete('/:id', adminOnly, async (req: Request & { db: any, params: PraktikumParams }, res: Response) => {
  try {
    const { id } = req.params
    await req.db.praktikum.delete({
      where: { id }
    })
    res.status(204).send()
  } catch (error) {
    console.error('Delete praktikum error:', error);
    res.status(500).json({ error: 'Internal server error' })
  }
})

export const praktikumRouter = router 