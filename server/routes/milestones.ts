import express from 'express';
import { getMilestones, acknowledgeMilestone } from '../lib/milestones';

const router = express.Router();

/**
 * GET /api/milestones
 * Fetch all milestones for the current workspace
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Get workspaceId from authenticated session
    const workspaceId = req.headers['x-workspace-id'] as string || 'default-workspace';

    const milestones = await getMilestones(workspaceId);
    res.json(milestones);
  } catch (err) {
    console.error('[API] Failed to fetch milestones:', err);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

/**
 * POST /api/milestones/:key/ack
 * Acknowledge a milestone (user has seen it)
 */
router.post('/:key/ack', async (req, res) => {
  try {
    const { key } = req.params;
    // TODO: Get workspaceId from authenticated session
    const workspaceId = req.headers['x-workspace-id'] as string || 'default-workspace';

    await acknowledgeMilestone(workspaceId, key as any);
    res.json({ success: true });
  } catch (err) {
    console.error('[API] Failed to acknowledge milestone:', err);
    res.status(500).json({ error: 'Failed to acknowledge milestone' });
  }
});

export default router;
