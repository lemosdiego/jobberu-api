-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "email_verificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "token_verificacao" TEXT;
