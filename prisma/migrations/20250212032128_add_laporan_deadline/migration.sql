/*
  Warnings:

  - Added the required column `deadline` to the `Laporan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Laporan" ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isLate" BOOLEAN NOT NULL DEFAULT false;
