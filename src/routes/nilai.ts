import { Router } from 'express';
import { assistantOrAdmin, authMiddleware } from '../middleware/auth';

const router = Router();

// Get all nilai records for a pertemuan
router.get('/pertemuan/:pertemuanId', authMiddleware, async (req: any, res) => {
  try {
    const { pertemuanId } = req.params;
    const nilai = await req.db.nilai.findMany({
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
    res.json(nilai);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nilai by ID
router.get('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const nilai = await req.db.nilai.findUnique({
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
    if (!nilai) {
      return res.status(404).json({ error: 'Nilai not found' });
    }
    res.json(nilai);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nilai records for a user
router.get('/user/:userId', authMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const nilai = await req.db.nilai.findMany({
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
    res.json(nilai);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Input or update nilai for a pertemuan (assistant or admin only)
router.post('/pertemuan/:pertemuanId', assistantOrAdmin, async (req: any, res) => {
  try {
    const { pertemuanId } = req.params;
    const { userId, praktikumScore, asistensiScore, laporanScore } = req.body;

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

    // Calculate final score (40% praktikum, 30% asistensi, 30% laporan)
    const finalScore = praktikumScore && asistensiScore && laporanScore
      ? (praktikumScore * 0.4) + (asistensiScore * 0.3) + (laporanScore * 0.3)
      : null;

    // Check if nilai already exists for this user and pertemuan
    const existingNilai = await req.db.nilai.findFirst({
      where: {
        userId,
        pertemuanId
      }
    });

    if (existingNilai) {
      // Update existing nilai
      const nilai = await req.db.nilai.update({
        where: { id: existingNilai.id },
        data: {
          praktikumScore,
          asistensiScore,
          laporanScore,
          finalScore
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
      res.json(nilai);
    } else {
      // Create new nilai
      const nilai = await req.db.nilai.create({
        data: {
          userId,
          pertemuanId,
          praktikumScore,
          asistensiScore,
          laporanScore,
          finalScore
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
      res.status(201).json(nilai);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete nilai (assistant or admin only)
router.delete('/:id', assistantOrAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    await req.db.nilai.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const nilaiRouter = router; 