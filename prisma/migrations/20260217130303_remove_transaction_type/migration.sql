/*
  Warnings:

  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "importJobId" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "amountGbp" DECIMAL NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "categoryId" TEXT,
    "assignedToMemberId" TEXT,
    "isSplit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_assignedToMemberId_fkey" FOREIGN KEY ("assignedToMemberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "amountGbp", "assignedToMemberId", "categoryId", "contentHash", "createdAt", "currency", "date", "description", "id", "importJobId", "isSplit", "notes", "rawData", "status", "updatedAt") SELECT "amount", "amountGbp", "assignedToMemberId", "categoryId", "contentHash", "createdAt", "currency", "date", "description", "id", "importJobId", "isSplit", "notes", "rawData", "status", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_contentHash_key" ON "Transaction"("contentHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
