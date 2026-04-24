/*
  Warnings:

  - You are about to drop the column `ProductoId` on the `Movimiento` table. All the data in the column will be lost.
  - Added the required column `productoId` to the `Movimiento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movimiento" DROP COLUMN "ProductoId",
ADD COLUMN     "productoId" INTEGER NOT NULL;
