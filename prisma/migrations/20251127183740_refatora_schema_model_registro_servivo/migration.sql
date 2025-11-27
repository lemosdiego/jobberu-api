/*
  Warnings:

  - You are about to drop the column `tipo` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registroId]` on the table `avaliacoes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StatusServico" AS ENUM ('PENDENTE_CONFIRMACAO_CLIENTE', 'CONCLUIDO', 'RECUSADO');

-- AlterTable
ALTER TABLE "avaliacoes" ADD COLUMN     "registroId" INTEGER;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "tipo",
ADD COLUMN     "is_prestador" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nivel_cliente" TEXT NOT NULL DEFAULT 'Bronze',
ADD COLUMN     "nivel_prestador" TEXT NOT NULL DEFAULT 'Bronze';

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "registros_servicos" (
    "id" SERIAL NOT NULL,
    "status" "StatusServico" NOT NULL DEFAULT 'PENDENTE_CONFIRMACAO_CLIENTE',
    "prestadorId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "registros_servicos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_registroId_key" ON "avaliacoes"("registroId");

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "registros_servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_servicos" ADD CONSTRAINT "registros_servicos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_servicos" ADD CONSTRAINT "registros_servicos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
