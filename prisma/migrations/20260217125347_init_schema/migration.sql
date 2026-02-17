/*
  Warnings:

  - You are about to drop the column `defaultType` on the `Category` table. All the data in the column will be lost.
  - You are about to alter the column `config` on the `ExtractionPattern` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to drop the column `rawDataJson` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `amountGbp` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to drop the column `categoryId` on the `TransactionSplit` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `TransactionSplit` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `amountGbp` on the `TransactionSplit` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - Added the required column `accountNumber` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankName` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `ImportJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentHash` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rawData` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN "nickname" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "nickname" TEXT,
    "currency" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CURRENT',
    "memberId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("createdAt", "currency", "id", "memberId", "name", "updatedAt") SELECT "createdAt", "currency", "id", "memberId", "name", "updatedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Category" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE TABLE "new_ExtractionPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExtractionPattern_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ExtractionPattern" ("accountId", "config", "createdAt", "id", "updatedAt") SELECT "accountId", "config", "createdAt", "id", "updatedAt" FROM "ExtractionPattern";
DROP TABLE "ExtractionPattern";
ALTER TABLE "new_ExtractionPattern" RENAME TO "ExtractionPattern";
CREATE TABLE "new_ImportJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "accountId" TEXT NOT NULL,
    "rawFilePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImportJob_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ImportJob" ("createdAt", "filename", "id", "rawFilePath", "status", "updatedAt") SELECT "createdAt", "filename", "id", "rawFilePath", "status", "updatedAt" FROM "ImportJob";
DROP TABLE "ImportJob";
ALTER TABLE "new_ImportJob" RENAME TO "ImportJob";
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
    "type" TEXT NOT NULL DEFAULT 'EXPENSE',
    "assignedToMemberId" TEXT,
    "isSplit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_assignedToMemberId_fkey" FOREIGN KEY ("assignedToMemberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "amountGbp", "assignedToMemberId", "categoryId", "createdAt", "currency", "id", "importJobId", "isSplit", "status", "type", "updatedAt") SELECT "amount", "amountGbp", "assignedToMemberId", "categoryId", "createdAt", "currency", "id", "importJobId", "isSplit", "status", coalesce("type", 'EXPENSE') AS "type", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_contentHash_key" ON "Transaction"("contentHash");
CREATE TABLE "new_TransactionSplit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "amountGbp" DECIMAL NOT NULL,
    "assignedToMemberId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransactionSplit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransactionSplit_assignedToMemberId_fkey" FOREIGN KEY ("assignedToMemberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TransactionSplit" ("amount", "amountGbp", "assignedToMemberId", "createdAt", "id", "transactionId", "updatedAt") SELECT "amount", "amountGbp", "assignedToMemberId", "createdAt", "id", "transactionId", "updatedAt" FROM "TransactionSplit";
DROP TABLE "TransactionSplit";
ALTER TABLE "new_TransactionSplit" RENAME TO "TransactionSplit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
