/*
  Warnings:

  - You are about to drop the column `tipo` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "tipo",
ADD COLUMN     "is_prestador" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "interesses_contato" (
    "id" SERIAL NOT NULL,
    "data_solicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,
    "prestadorId" INTEGER NOT NULL,

    CONSTRAINT "interesses_contato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interesses_contato_clienteId_prestadorId_key" ON "interesses_contato"("clienteId", "prestadorId");

-- AddForeignKey
ALTER TABLE "interesses_contato" ADD CONSTRAINT "interesses_contato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
