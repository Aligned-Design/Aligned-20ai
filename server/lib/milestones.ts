import { db } from '@db';
import type { MilestoneKey } from '../../client/lib/milestones';

/**
 * Unlock a milestone for a workspace (idempotent)
 * @param workspaceId - The workspace ID
 * @param key - The milestone key
 * @returns The milestone record
 */
export async function unlockMilestone(workspaceId: string, key: MilestoneKey) {
  try {
    // Check if already unlocked
    const existing = await db.query.milestones.findFirst({
      where: (milestones, { eq, and }) =>
        and(
          eq(milestones.workspaceId, workspaceId),
          eq(milestones.key, key)
        ),
    });

    if (existing) {
      return existing; // Already unlocked - idempotent
    }

    // Create new milestone
    const [milestone] = await db
      .insert(db.schema.milestones)
      .values({
        workspaceId,
        key,
        unlockedAt: new Date(),
      })
      .returning();

    // TODO: Notify clients via WebSocket when available
    // ws.publish(`milestones:${workspaceId}`, { key });

    console.log(`[Milestone] Unlocked ${key} for workspace ${workspaceId}`);

    return milestone;
  } catch (err) {
    console.error(`[Milestone] Failed to unlock ${key}:`, err);
    throw err;
  }
}

/**
 * Check if a milestone is unlocked
 * @param workspaceId - The workspace ID
 * @param key - The milestone key
 */
export async function isMilestoneUnlocked(
  workspaceId: string,
  key: MilestoneKey
): Promise<boolean> {
  try {
    const milestone = await db.query.milestones.findFirst({
      where: (milestones, { eq, and }) =>
        and(
          eq(milestones.workspaceId, workspaceId),
          eq(milestones.key, key)
        ),
    });

    return !!milestone;
  } catch (err) {
    console.error(`[Milestone] Failed to check ${key}:`, err);
    return false;
  }
}

/**
 * Get all milestones for a workspace
 * @param workspaceId - The workspace ID
 */
export async function getMilestones(workspaceId: string) {
  try {
    return await db.query.milestones.findMany({
      where: (milestones, { eq }) => eq(milestones.workspaceId, workspaceId),
      orderBy: (milestones, { desc }) => [desc(milestones.unlockedAt)],
    });
  } catch (err) {
    console.error('[Milestone] Failed to fetch milestones:', err);
    return [];
  }
}

/**
 * Acknowledge a milestone (user has seen the celebration)
 * @param workspaceId - The workspace ID
 * @param key - The milestone key
 */
export async function acknowledgeMilestone(workspaceId: string, key: MilestoneKey) {
  try {
    await db
      .update(db.schema.milestones)
      .set({ acknowledgedAt: new Date() })
      .where(
        db.and(
          db.eq(db.schema.milestones.workspaceId, workspaceId),
          db.eq(db.schema.milestones.key, key)
        )
      );

    console.log(`[Milestone] Acknowledged ${key} for workspace ${workspaceId}`);
  } catch (err) {
    console.error(`[Milestone] Failed to acknowledge ${key}:`, err);
    throw err;
  }
}
