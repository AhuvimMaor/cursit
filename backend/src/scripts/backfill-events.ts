import type { CommandCandidacy, CourseRegistration, PrismaClient } from '@prisma/client';
import { pathToFileURL } from 'node:url';

import { appendEvent } from '../lib/append-event.js';
import { prisma } from '../lib/prisma.js';

function candidacyPayload(c: CommandCandidacy) {
  return {
    id: c.id,
    courseInstanceId: c.courseInstanceId,
    candidateId: c.candidateId,
    submittedById: c.submittedById,
    status: c.status,
    motivation: c.motivation,
    commanderNotes: c.commanderNotes,
    formData: c.formData,
    reviewedById: c.reviewedById,
    reviewNotes: c.reviewNotes,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

function registrationPayload(r: CourseRegistration) {
  return {
    id: r.id,
    courseInstanceId: r.courseInstanceId,
    userId: r.userId,
    status: r.status,
    formData: r.formData,
    coordApprovedById: r.coordApprovedById,
    coordApprovedAt: r.coordApprovedAt?.toISOString() ?? null,
    coordNotes: r.coordNotes,
    coordPriority: r.coordPriority,
    bisApprovedById: r.bisApprovedById,
    bisApprovedAt: r.bisApprovedAt?.toISOString() ?? null,
    bisNotes: r.bisNotes,
    rejectionReason: r.rejectionReason,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** Inserts one snapshot event per candidacy/registration that has no events yet (e.g. existing rows before logging shipped). */
export async function backfillEventsIfMissing(db: PrismaClient) {
  const candidacies = await db.commandCandidacy.findMany();
  for (const c of candidacies) {
    const existing = await db.event.findFirst({
      where: { aggregateType: 'CANDIDACY', aggregateId: c.id },
      select: { id: true },
    });
    if (existing) continue;
    await db.$transaction(async (tx) => {
      await appendEvent(tx, {
        eventType: 'candidacy.migrated',
        aggregateType: 'CANDIDACY',
        aggregateId: c.id,
        actorUserId: null,
        payload: { source: 'backfill', record: candidacyPayload(c) },
        flowId: null,
      });
    });
  }

  const registrations = await db.courseRegistration.findMany();
  for (const r of registrations) {
    const existing = await db.event.findFirst({
      where: { aggregateType: 'REGISTRATION', aggregateId: r.id },
      select: { id: true },
    });
    if (existing) continue;
    await db.$transaction(async (tx) => {
      await appendEvent(tx, {
        eventType: 'registration.migrated',
        aggregateType: 'REGISTRATION',
        aggregateId: r.id,
        actorUserId: null,
        payload: { source: 'backfill', record: registrationPayload(r) },
        flowId: null,
      });
    });
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isMain) {
  backfillEventsIfMissing(prisma)
    .then(() => console.log('Event backfill complete.'))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
