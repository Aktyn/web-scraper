/*
  Warnings:

  - A unique constraint covering the columns `[siteId]` on the table `Instruction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Instruction_siteId_key" ON "Instruction"("siteId");
