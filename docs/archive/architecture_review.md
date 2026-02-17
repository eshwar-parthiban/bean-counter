# Architecture Review: Bean Counter

## Executive Summary
The proposed "Local-First" architecture using **Next.js 16 + SQLite + Prisma** is an excellent choice for a personal finance application. It balances performance, developer experience, and privacy perfectly. The "Single File DB" approach with SQLite makes backups trivial.

## Critical Findings & Resolutions

### 1. Money Handling (Resolved)
**Issue:** Initial plan used `Float` for money.
**Resolution:** Adopted `Decimal` type in Prisma for precision. Added `amount` (original currency) and `amountGbp` (normalized).

### 2. Transaction Model (Resolved)
**Issue:** Missing critical fields for sorting and searching.
**Resolution:**
- Added `date` (DateTime) and `description` (String) as top-level columns.
- Added `contentHash` (String, Unique) to prevent duplicate imports.
- Added `notes` (String?) for user annotations.
- Changed `rawDataJson` to `Json` type for better developer experience.
- Added strict Enums: `TransactionStatus` (DRAFT, POSTED) and `TransactionType` (EXPENSE, INCOME, TRANSFER, SETTLEMENT).

### 3. Member & Account Logic (Resolved)
**Resolution:**
- **Member**: Added `nickname`.
- **Account**: Added `bankName`, `accountNumber`, `nickname`.
- **Debt Logic**: Determined by `Account.memberId` (Payer) vs `Transaction.assignedToMemberId` (Consumer/Owner). If Payer != Owner, a debt exists.

### 4. Category & Splits (Resolved)
**Resolution:**
- **Splits**: Removed `category` from splits. Splits are purely for dividing cost between *members*.
- **Category**: Removed `defaultType`. Categories are simple tags.

### 5. Enums (Resolved)
Strict enums implemented to prevent validaty errors:
- `Currency`: GBP, INR, SGD, USD
- `AccountType`: CURRENT, SAVINGS, CREDIT_CARD
- `ImportStatus`: PROCESSING, COMPLETED, FAILED

## Finalized Schema Snapshot

```prisma
model Member {
  id           String             @id @default(cuid())
  name         String
  nickname     String?
  accounts     Account[]
  transactions Transaction[]      @relation("AssignedTo")
  splits       TransactionSplit[]
  // ...
}

model Account {
  id            String            @id @default(cuid())
  bankName      String
  accountNumber String
  nickname      String?
  currency      Currency
  type          AccountType       @default(CURRENT)
  memberId      String
  member        Member            @relation(fields: [memberId], references: [id])
  importJobs    ImportJob[]
  // ...
}

model Transaction {
  id                 String             @id @default(cuid())
  date               DateTime
  description        String
  amount             Decimal
  currency           Currency
  amountGbp          Decimal
  notes              String?
  status             TransactionStatus  @default(DRAFT)

  contentHash        String             @unique
  rawData            Json
  
  importJobId        String
  importJob          ImportJob          @relation(...)
  categoryId         String?
  category           Category?          @relation(...)
  assignedToMemberId String?
  assignedToMember   Member?            @relation("AssignedTo", ...)
  splits             TransactionSplit[]
}

model TransactionSplit {
  id                 String      @id @default(cuid())
  transactionId      String
  transaction        Transaction @relation(...)
  amount             Decimal
  amountGbp          Decimal
  assignedToMemberId String
  assignedToMember   Member      @relation(...)
}

model Category {
  id   String @id @default(cuid())
  name String
  // ...
}

model ExtractionPattern {
  id     String @id @default(cuid())
  config Json   // JSON mapping rules
  // ...
}
```

## Next Steps
1.  **Seed Data**: Create `prisma/seed.ts` to populate initial Members and Accounts.
2.  **Ingestion Engine**: Build the CSV upload and parsing logic using the new Schema.
