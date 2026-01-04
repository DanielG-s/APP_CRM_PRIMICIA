-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "lastOrderDate" TIMESTAMP(3),
ADD COLUMN     "ordersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rfmStatus" TEXT DEFAULT 'Novos / Sem Dados';
