/*
  Warnings:

  - You are about to drop the column `praktikumId` on the `Asistensi` table. All the data in the column will be lost.
  - You are about to drop the column `praktikumId` on the `Laporan` table. All the data in the column will be lost.
  - You are about to drop the column `praktikumId` on the `Nilai` table. All the data in the column will be lost.
  - You are about to drop the column `periodId` on the `Praktikum` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pertemuanId]` on the table `Praktikum` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pertemuanId` to the `Asistensi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pertemuanId` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pertemuanId` to the `Nilai` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pertemuanId` to the `Praktikum` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Asistensi" DROP CONSTRAINT "Asistensi_praktikumId_fkey";

-- DropForeignKey
ALTER TABLE "Laporan" DROP CONSTRAINT "Laporan_praktikumId_fkey";

-- DropForeignKey
ALTER TABLE "Nilai" DROP CONSTRAINT "Nilai_praktikumId_fkey";

-- DropForeignKey
ALTER TABLE "Praktikum" DROP CONSTRAINT "Praktikum_periodId_fkey";

-- AlterTable
ALTER TABLE "Asistensi" DROP COLUMN "praktikumId",
ADD COLUMN     "pertemuanId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Laporan" DROP COLUMN "praktikumId",
ADD COLUMN     "pertemuanId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Nilai" DROP COLUMN "praktikumId",
ADD COLUMN     "pertemuanId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Praktikum" DROP COLUMN "periodId",
ADD COLUMN     "pertemuanId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Pertemuan" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "periodId" TEXT NOT NULL,

    CONSTRAINT "Pertemuan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Praktikum_pertemuanId_key" ON "Praktikum"("pertemuanId");

-- AddForeignKey
ALTER TABLE "Pertemuan" ADD CONSTRAINT "Pertemuan_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Praktikum" ADD CONSTRAINT "Praktikum_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistensi" ADD CONSTRAINT "Asistensi_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
