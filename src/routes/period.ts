import { Router, Response } from 'express';
import { adminOnly, authMiddleware } from '../middleware/auth';
import { TypedRequestBody, TypedRequestParams, TypedRequest } from '../types/express';
import { CreatePeriodRequest, CreatePertemuanRequest } from '../types/models';
import { Request } from 'express-serve-static-core';

const router = Router();

interface PeriodParams {
  id: string;
}

interface PeriodPertemuanParams {
  periodId: string;
}

// Get all periods
router.get('/', authMiddleware, async (req: Request & { db: any }, res: Response) => {
  try {
    const periods = await req.db.period.findMany({
      include: {
        pertemuan: {
          include: {
            praktikum: true,
            asistensi: true,
            laporan: true,
            nilai: true
          }
        }
      }
    });
    res.json(periods);
  } catch (error) {
    console.error('Get periods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get period by ID
router.get('/:id', authMiddleware, async (req: Request & { db: any, params: PeriodParams }, res: Response) => {
  try {
    const { id } = req.params;
    const period = await req.db.period.findUnique({
      where: { id },
      include: {
        pertemuan: {
          include: {
            praktikum: true,
            asistensi: true,
            laporan: true,
            nilai: true
          }
        }
      }
    });
    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }
    res.json(period);
  } catch (error) {
    console.error('Get period error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new period (admin only)
router.post('/', adminOnly, async (req: Request & { db: any, body: CreatePeriodRequest }, res: Response) => {
  try {
    const { name, startDate, endDate } = req.body;
    const period = await req.db.period.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
    res.status(201).json(period);
  } catch (error) {
    console.error('Create period error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all pertemuan for a period
router.get('/:periodId/pertemuan', authMiddleware, async (req: Request & { db: any, params: PeriodPertemuanParams }, res: Response) => {
  try {
    const { periodId } = req.params;
    const pertemuan = await req.db.pertemuan.findMany({
      where: { periodId },
      include: {
        praktikum: true,
        asistensi: true,
        laporan: true,
        nilai: true
      },
      orderBy: {
        number: 'asc'
      }
    });
    res.json(pertemuan);
  } catch (error) {
    console.error('Get pertemuan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new pertemuan for a period (admin only)
router.post('/:periodId/pertemuan', adminOnly, async (req: Request & { db: any, body: CreatePertemuanRequest, params: PeriodPertemuanParams }, res: Response) => {
  try {
    const { periodId } = req.params;
    const { number } = req.body;

    // Check if pertemuan number already exists for this period
    const existingPertemuan = await req.db.pertemuan.findFirst({
      where: {
        periodId,
        number
      }
    });

    if (existingPertemuan) {
      return res.status(400).json({ error: `Pertemuan ${number} already exists for this period` });
    }

    const pertemuan = await req.db.pertemuan.create({
      data: {
        number,
        periodId
      }
    });
    res.status(201).json(pertemuan);
  } catch (error) {
    console.error('Create pertemuan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update period (admin only)
router.put('/:id', adminOnly, async (req: Request & { db: any, body: CreatePeriodRequest, params: PeriodParams }, res: Response) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;
    const period = await req.db.period.update({
      where: { id },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
    res.json(period);
  } catch (error) {
    console.error('Update period error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete period (admin only)
router.delete('/:id', adminOnly, async (req: Request & { db: any, params: PeriodParams }, res: Response) => {
  try {
    const { id } = req.params;
    await req.db.period.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete period error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const periodRouter = router; 