import { Router } from 'express';
import { assistantOrAdmin, authMiddleware } from '../middleware/auth';

const router = Router();

// Get all laporan records for a pertemuan
router.get('/pertemuan/:pertemuanId', authMiddleware, async (req: any, res) => {
  try {
    const { pertemuanId } = req.params;
    const laporan = await req.db.laporan.findMany({
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
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get laporan by ID
router.get('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const laporan = await req.db.laporan.findUnique({
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
    if (!laporan) {
      return res.status(404).json({ error: 'Laporan not found' });
    }
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get laporan records for a user
router.get('/user/:userId', authMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const laporan = await req.db.laporan.findMany({
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
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit laporan for a pertemuan
router.post('/pertemuan/:pertemuanId', authMiddleware, async (req: any, res) => {
  try {
    const { pertemuanId } = req.params;
    const { userId } = req.body;

    // Check if pertemuan exists and get its details
    const pertemuan = await req.db.pertemuan.findUnique({
      where: { id: pertemuanId },
      include: {
        period: true,
        praktikum: true
      }
    });

    if (!pertemuan) {
      return res.status(404).json({ error: 'Pertemuan not found' });
    }

    if (!pertemuan.praktikum) {
      return res.status(400).json({ error: 'Praktikum session not found for this pertemuan' });
    }

    // Get next pertemuan for deadline
    const nextPertemuan = await req.db.pertemuan.findFirst({
      where: {
        periodId: pertemuan.periodId,
        number: pertemuan.number + 1
      },
      include: {
        praktikum: true
      }
    });

    if (!nextPertemuan?.praktikum?.date) {
      return res.status(400).json({ 
        error: 'Cannot submit laporan yet. Next pertemuan must be scheduled first to set the deadline.' 
      });
    }

    // Check if laporan already exists for this user and pertemuan
    const existingLaporan = await req.db.laporan.findFirst({
      where: {
        userId,
        pertemuanId
      }
    });

    if (existingLaporan) {
      return res.status(400).json({ error: 'Laporan already exists for this user and pertemuan' });
    }

    const now = new Date();
    const deadline = nextPertemuan.praktikum.date;
    const isLate = now > deadline;

    const laporan = await req.db.laporan.create({
      data: {
        userId,
        pertemuanId,
        submittedAt: now,
        deadline,
        isLate
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

    // Return the Google Form URL with the response
    const response = {
      laporan,
      googleFormUrl: pertemuan.praktikum.googleFormUrl
    };

    // If submission is late, add a warning
    if (isLate) {
      return res.status(201).json({
        ...response,
        warning: 'Laporan was submitted after the deadline. This may affect your score.'
      });
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Google Form URL for a pertemuan
router.get('/pertemuan/:pertemuanId/form', authMiddleware, async (req: any, res) => {
  try {
    const { pertemuanId } = req.params;

    const pertemuan = await req.db.pertemuan.findUnique({
      where: { id: pertemuanId },
      include: {
        praktikum: true
      }
    });

    if (!pertemuan) {
      return res.status(404).json({ error: 'Pertemuan not found' });
    }

    if (!pertemuan.praktikum) {
      return res.status(404).json({ error: 'Praktikum not found for this pertemuan' });
    }

    res.json({ googleFormUrl: pertemuan.praktikum.googleFormUrl });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Score laporan (assistant or admin only)
router.put('/:id/score', assistantOrAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    // Get laporan to check if it was submitted late
    const laporan = await req.db.laporan.findUnique({
      where: { id }
    });

    if (!laporan) {
      return res.status(404).json({ error: 'Laporan not found' });
    }

    // Apply late submission penalty (e.g., 20% reduction)
    const finalScore = laporan.isLate ? score * 0.8 : score;

    const updatedLaporan = await req.db.laporan.update({
      where: { id },
      data: {
        score: finalScore
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

    // If score was reduced due to late submission, include a note in the response
    if (laporan.isLate) {
      return res.json({
        laporan: updatedLaporan,
        note: 'Score was reduced by 20% due to late submission'
      });
    }

    res.json(updatedLaporan);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming deadlines for a user
router.get('/deadlines/:userId', authMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.params;
    
    // Get all pertemuan with their praktikum dates
    const pertemuans = await req.db.pertemuan.findMany({
      include: {
        period: true,
        praktikum: true,
        laporan: {
          where: {
            userId
          }
        }
      },
      orderBy: {
        number: 'asc'
      }
    });

    // Format deadlines
    const deadlines = pertemuans
      .filter(p => p.praktikum) // Only include pertemuan that have praktikum scheduled
      .map(p => {
        const nextPertemuan = pertemuans.find(np => 
          np.periodId === p.periodId && 
          np.number === p.number + 1 &&
          np.praktikum
        );

        return {
          pertemuanId: p.id,
          pertemuanNumber: p.number,
          periodName: p.period.name,
          praktikumDate: p.praktikum?.date,
          googleFormUrl: p.praktikum?.googleFormUrl,
          deadline: nextPertemuan?.praktikum?.date || null,
          hasSubmitted: p.laporan.length > 0,
          isLate: p.laporan[0]?.isLate || false
        };
      })
      .filter(d => d.deadline); // Only include if deadline can be determined

    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete laporan (assistant or admin only)
router.delete('/:id', assistantOrAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    await req.db.laporan.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const laporanRouter = router; 