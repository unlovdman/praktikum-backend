import { Router, Response } from 'express';
import { assistantOrAdmin, authMiddleware } from '../middleware/auth';
import { TypedRequestBody, TypedRequestParams, TypedRequest } from '../types/express';
import { CreateAsistensiRequest } from '../types/models';
import { Request } from 'express-serve-static-core';

const router = Router();

interface AsistensiParams {
  id: string;
}

interface PertemuanParams {
  pertemuanId: string;
}

interface UserParams {
  userId: string;
}

// Get all asistensi records for a pertemuan
router.get('/pertemuan/:pertemuanId', authMiddleware, async (req: Request & { db: any, params: PertemuanParams }, res: Response) => {
  try {
    const { pertemuanId } = req.params;
    const asistensi = await req.db.asistensi.findMany({
      where: { pertemuanId },
      include: {
        user: true,
        pertemuan: {
          include: {
            period: true,
            praktikum: true
          }
        }
      }
    });
    res.json(asistensi);
  } catch (error) {
    console.error('Get asistensi records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get asistensi by ID
router.get('/:id', authMiddleware, async (req: Request & { db: any, params: AsistensiParams }, res: Response) => {
  try {
    const { id } = req.params;
    const asistensi = await req.db.asistensi.findUnique({
      where: { id },
      include: {
        user: true,
        pertemuan: {
          include: {
            period: true,
            praktikum: true
          }
        }
      }
    });
    if (!asistensi) {
      return res.status(404).json({ error: 'Asistensi not found' });
    }
    res.json(asistensi);
  } catch (error) {
    console.error('Get asistensi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get asistensi records for a user
router.get('/user/:userId', authMiddleware, async (req: Request & { db: any, params: UserParams }, res: Response) => {
  try {
    const { userId } = req.params;
    const asistensi = await req.db.asistensi.findMany({
      where: { userId },
      include: {
        user: true,
        pertemuan: {
          include: {
            period: true,
            praktikum: true
          }
        }
      },
      orderBy: {
        pertemuan: {
          number: 'asc'
        }
      }
    });
    res.json(asistensi);
  } catch (error) {
    console.error('Get user asistensi records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record asistensi for a pertemuan (assistant or admin only)
router.post('/pertemuan/:pertemuanId', assistantOrAdmin, async (req: Request & { db: any, body: CreateAsistensiRequest, params: PertemuanParams }, res: Response) => {
  try {
    const { pertemuanId } = req.params;
    const { userId, attendance, score } = req.body;

    // Check if pertemuan exists
    const pertemuan = await req.db.pertemuan.findUnique({
      where: { id: pertemuanId },
      include: {
        praktikum: true
      }
    });

    if (!pertemuan) {
      return res.status(404).json({ error: 'Pertemuan not found' });
    }

    // Check if asistensi already exists for this user and pertemuan
    const existingAsistensi = await req.db.asistensi.findFirst({
      where: {
        userId,
        pertemuanId
      }
    });

    if (existingAsistensi) {
      return res.status(400).json({ error: 'Asistensi already exists for this user and pertemuan' });
    }

    const asistensi = await req.db.asistensi.create({
      data: {
        userId,
        pertemuanId,
        attendance,
        score,
        date: new Date()
      },
      include: {
        user: true,
        pertemuan: {
          include: {
            period: true,
            praktikum: true
          }
        }
      }
    });
    res.status(201).json(asistensi);
  } catch (error) {
    console.error('Create asistensi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update asistensi (assistant or admin only)
router.put('/:id', assistantOrAdmin, async (req: Request & { db: any, body: Partial<CreateAsistensiRequest>, params: AsistensiParams }, res: Response) => {
  try {
    const { id } = req.params;
    const { attendance, score } = req.body;
    const asistensi = await req.db.asistensi.update({
      where: { id },
      data: {
        attendance,
        score
      },
      include: {
        user: true,
        pertemuan: {
          include: {
            period: true,
            praktikum: true
          }
        }
      }
    });
    res.json(asistensi);
  } catch (error) {
    console.error('Update asistensi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete asistensi (assistant or admin only)
router.delete('/:id', assistantOrAdmin, async (req: Request & { db: any, params: AsistensiParams }, res: Response) => {
  try {
    const { id } = req.params;
    await req.db.asistensi.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete asistensi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const asistensiRouter = router; 