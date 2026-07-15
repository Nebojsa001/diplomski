/*
  Warnings:

  - A unique constraint covering the columns `[nextAppointmentId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'InProgress';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "doctorId" INTEGER,
ADD COLUMN     "nextAppointmentId" INTEGER;

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalReport" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalReportDiagnosis" (
    "reportId" INTEGER NOT NULL,
    "diagnosisId" INTEGER NOT NULL,

    CONSTRAINT "MedicalReportDiagnosis_pkey" PRIMARY KEY ("reportId","diagnosisId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_code_key" ON "Diagnosis"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalReport_appointmentId_key" ON "MedicalReport"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_nextAppointmentId_key" ON "Appointment"("nextAppointmentId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_nextAppointmentId_fkey" FOREIGN KEY ("nextAppointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalReport" ADD CONSTRAINT "MedicalReport_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalReport" ADD CONSTRAINT "MedicalReport_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalReportDiagnosis" ADD CONSTRAINT "MedicalReportDiagnosis_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MedicalReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalReportDiagnosis" ADD CONSTRAINT "MedicalReportDiagnosis_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
