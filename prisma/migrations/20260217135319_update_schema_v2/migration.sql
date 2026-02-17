/*
  Warnings:

  - Added the required column `categoryId` to the `TransactionSplit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransactionSplit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "amountGbp" DECIMAL NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedToMemberId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransactionSplit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransactionSplit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransactionSplit_assignedToMemberId_fkey" FOREIGN KEY ("assignedToMemberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TransactionSplit" ("amount", "amountGbp", "assignedToMemberId", "createdAt", "id", "transactionId", "updatedAt") SELECT "amount", "amountGbp", "assignedToMemberId", "createdAt", "id", "transactionId", "updatedAt" FROM "TransactionSplit";
DROP TABLE "TransactionSplit";
ALTER TABLE "new_TransactionSplit" RENAME TO "TransactionSplit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
