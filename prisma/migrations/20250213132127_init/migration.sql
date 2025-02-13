/*
  Warnings:

  - You are about to drop the column `googleFormUrl` on the `Laporan` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `googleFormUrl` to the `Praktikum` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Laporan" DROP COLUMN "googleFormUrl";

-- AlterTable
ALTER TABLE "Praktikum" ADD COLUMN     "googleFormUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'PRAKTIKAN';

-- DropEnum
DROP TYPE "Role";
