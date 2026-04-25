/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "imageUrl",
ADD COLUMN     "criticidad" TEXT NOT NULL DEFAULT 'Media',
ADD COLUMN     "imagen" TEXT;
