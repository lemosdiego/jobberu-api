-- DropForeignKey
ALTER TABLE "servicos" DROP CONSTRAINT "servicos_prestadorId_fkey";

-- AlterTable
ALTER TABLE "avaliacoes" ADD COLUMN     "aprovada" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "aprovado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "aprovado" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
