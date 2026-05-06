-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('KEVA', 'MANDATORY');

-- AlterEnum
ALTER TYPE "RegistrationStatus" ADD VALUE 'PENDING_UNIT_TRAINING';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'UNIT_TRAINING';

-- AlterTable
ALTER TABLE "CourseRegistration" ADD COLUMN     "unitTrainingApprovedAt" TIMESTAMP(3),
ADD COLUMN     "unitTrainingApprovedById" INTEGER,
ADD COLUMN     "unitTrainingNotes" TEXT;

-- CreateTable
CREATE TABLE "SoldierProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "remainingServiceMonths" INTEGER,
    "gamushHoursCompleted" INTEGER NOT NULL DEFAULT 0,
    "gamushHoursRequired" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoldierProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "usedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SoldierProfile_userId_key" ON "SoldierProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_year_key" ON "Budget"("year");

-- AddForeignKey
ALTER TABLE "SoldierProfile" ADD CONSTRAINT "SoldierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRegistration" ADD CONSTRAINT "CourseRegistration_unitTrainingApprovedById_fkey" FOREIGN KEY ("unitTrainingApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
