-- CreateTable
CREATE TABLE "RegistrationFile" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "filename" VARCHAR(256) NOT NULL,
    "originalName" VARCHAR(256) NOT NULL,
    "mimeType" VARCHAR(128) NOT NULL,
    "size" INTEGER NOT NULL,
    "storagePath" VARCHAR(512) NOT NULL,
    "uploadedById" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistrationFile_registrationId_idx" ON "RegistrationFile"("registrationId");

-- AddForeignKey
ALTER TABLE "RegistrationFile" ADD CONSTRAINT "RegistrationFile_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "CourseRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationFile" ADD CONSTRAINT "RegistrationFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
