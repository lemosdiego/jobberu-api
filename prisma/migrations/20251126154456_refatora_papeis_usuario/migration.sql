/*
  Warnings:

  - You are about to drop the column `is_prestador` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `interesses_contato` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tipo` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENTE', 'PRESTADOR');

-- DropForeignKey
ALTER TABLE "interesses_contato" DROP CONSTRAINT "interesses_contato_clienteId_fkey";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "is_prestador",
ADD COLUMN     "tipo" "UserRole" NOT NULL;

-- DropTable
DROP TABLE "interesses_contato";
