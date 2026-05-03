-- CreateEnum
CREATE TYPE "AggregateType" AS ENUM ('USER', 'COURSE', 'COURSE_INSTANCE', 'COURSE_PHASE', 'CANDIDACY', 'REGISTRATION');

-- CreateTable
CREATE TABLE "Event" (
    "id" BIGSERIAL NOT NULL,
    "eventType" VARCHAR(64) NOT NULL,
    "aggregateType" "AggregateType" NOT NULL,
    "aggregateId" INTEGER NOT NULL,
    "actorUserId" INTEGER,
    "payload" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "flowId" UUID,
    "causationEventId" BIGINT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_aggregateType_aggregateId_version_key" ON "Event"("aggregateType", "aggregateId", "version");

-- CreateIndex
CREATE INDEX "Event_aggregateType_aggregateId_occurredAt_idx" ON "Event"("aggregateType", "aggregateId", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_eventType_occurredAt_idx" ON "Event"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_actorUserId_occurredAt_idx" ON "Event"("actorUserId", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_flowId_idx" ON "Event"("flowId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_causationEventId_fkey" FOREIGN KEY ("causationEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
