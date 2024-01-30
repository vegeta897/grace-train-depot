-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('default', 'trusted', 'hidden', 'banned');

-- CreateEnum
CREATE TYPE "ModAction" AS ENUM ('changeUserLevel', 'deleteUser');

-- CreateTable
CREATE TABLE "auth_user" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twitchUserId" TEXT NOT NULL,
    "twitchUsername" TEXT NOT NULL,
    "twitchDisplayName" TEXT NOT NULL,
    "trustLevel" "TrustLevel" NOT NULL DEFAULT 'default',

    CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_key" (
    "id" TEXT NOT NULL,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "auth_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "shortId" VARCHAR(8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "body" TEXT NOT NULL DEFAULT 'boxy',
    "bodyColor" TEXT,
    "bodyPopColor" TEXT,
    "wheelColor" TEXT,
    "wheelFromCenter" INTEGER NOT NULL DEFAULT 100,
    "wheelSize" INTEGER NOT NULL DEFAULT 25,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decal" (
    "carId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "fill" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "scale" DOUBLE PRECISION NOT NULL,
    "rotate" DOUBLE PRECISION NOT NULL,
    "params" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Decal_pkey" PRIMARY KEY ("carId","slot")
);

-- CreateTable
CREATE TABLE "Topper" (
    "carId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "offset" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "rotate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "params" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Topper_pkey" PRIMARY KEY ("carId","slot")
);

-- CreateTable
CREATE TABLE "GraceTrain" (
    "id" BIGINT NOT NULL,
    "ended" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GraceTrain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraceTrainCar" (
    "trainId" BIGINT NOT NULL,
    "index" INTEGER NOT NULL,
    "carId" INTEGER,
    "carRevision" INTEGER,
    "userId" TEXT,
    "twitchUserId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "carData" JSONB NOT NULL,

    CONSTRAINT "GraceTrainCar_pkey" PRIMARY KEY ("trainId","index")
);

-- CreateTable
CREATE TABLE "GraceTrainCarStats" (
    "carId" INTEGER NOT NULL,
    "graceTrainCount" INTEGER NOT NULL DEFAULT 0,
    "totalAppearances" INTEGER NOT NULL DEFAULT 0,
    "lastGraceTrainId" BIGINT NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modId" TEXT NOT NULL,
    "onUserId" TEXT,
    "action" "ModAction" NOT NULL,
    "data" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_id_key" ON "auth_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_twitchUserId_key" ON "auth_user"("twitchUserId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_twitchUsername_key" ON "auth_user"("twitchUsername");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_twitchDisplayName_key" ON "auth_user"("twitchDisplayName");

-- CreateIndex
CREATE INDEX "auth_user_id_idx" ON "auth_user" USING HASH ("id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_session_id_key" ON "auth_session"("id");

-- CreateIndex
CREATE INDEX "auth_session_user_id_idx" ON "auth_session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_key_id_key" ON "auth_key"("id");

-- CreateIndex
CREATE INDEX "auth_key_user_id_idx" ON "auth_key"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Car_shortId_key" ON "Car"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "GraceTrain_id_key" ON "GraceTrain"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GraceTrainCarStats_carId_key" ON "GraceTrainCarStats"("carId");

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_key" ADD CONSTRAINT "auth_key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decal" ADD CONSTRAINT "Decal_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topper" ADD CONSTRAINT "Topper_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraceTrainCar" ADD CONSTRAINT "GraceTrainCar_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "GraceTrain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraceTrainCar" ADD CONSTRAINT "GraceTrainCar_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraceTrainCar" ADD CONSTRAINT "GraceTrainCar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraceTrainCarStats" ADD CONSTRAINT "GraceTrainCarStats_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_modId_fkey" FOREIGN KEY ("modId") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_onUserId_fkey" FOREIGN KEY ("onUserId") REFERENCES "auth_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
