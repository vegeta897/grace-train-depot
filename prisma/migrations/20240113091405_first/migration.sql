/*
  Warnings:

  - The `body` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `wheelFromCenter` on the `Car` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Made the column `name` on table `Car` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('default', 'trusted', 'flagged', 'banned');

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "wheelSize" INTEGER NOT NULL DEFAULT 25,
ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "body",
ADD COLUMN     "body" TEXT NOT NULL DEFAULT 'boxy',
ALTER COLUMN "wheelFromCenter" SET DEFAULT 100,
ALTER COLUMN "wheelFromCenter" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "GraceTrainCar" ADD COLUMN     "carRevision" INTEGER;

-- AlterTable
ALTER TABLE "auth_user" ADD COLUMN     "trustLevel" "TrustLevel" NOT NULL DEFAULT 'default';

-- DropEnum
DROP TYPE "Body";

-- CreateTable
CREATE TABLE "GraceTrainCarStats" (
    "carId" INTEGER NOT NULL,
    "graceTrainCount" INTEGER NOT NULL DEFAULT 0,
    "totalAppearances" INTEGER NOT NULL DEFAULT 0,
    "lastGraceTrainId" BIGINT NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "GraceTrainCarStats_carId_key" ON "GraceTrainCarStats"("carId");

-- AddForeignKey
ALTER TABLE "GraceTrainCarStats" ADD CONSTRAINT "GraceTrainCarStats_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
