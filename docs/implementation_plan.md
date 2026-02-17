# Transaction Tracking System - Architecture Proposal

## Overview
A personal finance tracking system designed to consolidate transactions from multiple banks/cards for yourself, your wife, and a joint account. The core focus is on easy CSV ingestion, intelligent categorization, and clear reporting of "Personal" (fun/hobbies) vs. "Living" (essential) expenses.

## User Review Required
> [!IMPORTANT]
> Since this involves personal financial data, confirm if you prefer a local-first application (data stays on your machine) or a hosted solution. The proposed architecture assumes a **Local-First Web App** for maximum privacy and control.

## Proposed Architecture

### Tech Stack & Rationale
- **Next.js (Full Stack Framework)**
    - *Why*: It unifies the Frontend (UI) and Backend (API) into a single project. This significantly simplifies development for a personal tool—no need to run/deploy a separate Python backend. It also supports **Server Actions**, allowing us to query the database directly from UI triggers safely.
- **TypeScript**
    - *Why*: **Yes, it is significantly better**, especially for financial data. It prevents common errors like treating "100.00" (string) as a number, which causes math errors. It ensures that every `Transaction` object strictly follows the schema (e.g., must have a `monitoring_category`), catching bugs instantly in the editor.
- **Database: SQLite (via Prisma/Drizzle)**
    - *Why*: A single-file database. Zero configuration, extremely fast, and easy to backup (just copy the `.db` file). Perfect for a local-first personal app.
- **UI: Tailwind CSS + Shadcn UI**
    - *Why*: Provides high-quality, accessible components (Selects, DatePickers, Tables) out of the box, speeding up the implementation of a "Premium" feel.

### Core Components

#### 1. Ingestion Engine
- **CSV Normalizer**:
  - Since banks export differently, we'll build a flexible mapper (Source Mapping Config).
  - Example: Bank A uses "Date, Desc, Amt", Bank B uses "Posted Date, Merchant, Value".
  - The system will detect headers or let you pick a mapping template on upload.

#### 2. Data Model (Finalized Schema)
- **Member**: `id`, `name`, `nickname`.
- **Account**: `bankName`, `accountNumber` (masked), `type` (Current/Savings), `currency`.
- **Transaction**:
    - `date`, `description`, `notes`
    - `amount` (Decimal), `amountGbp` (Decimal)
    - `status` (Enum: DRAFT, POSTED)
    - `category_id` (Tagging)
    - `assignedToMemberId` (Owner of expense)
    - `contentHash` (Prevent duplicates)
- **TransactionSplit**: Allows splitting cost between members.
- **ExtractionPattern**: JSON config for parsing CSVs.

#### 3. Workflow (Asynchronous Triage)
1. **Upload**: 
   - File saved -> Rows parsed -> Inserted as `Draft` transactions (Uncategorized).
2. **Auto-Categorization**: 
   - Rules engine runs in background. Matches are updated to `Posted`.
3. **Triage / Review (UI)**:
   - User views "Uncategorized" list.
   - **Split Action**: User can click "Split" on any transaction.
     - Modal opens to allocate amounts to different Members/Categories.
     - Validates that splits sum to total.
     - Saves `TransactionSplit` records and sets `is_split=true`.
   - Bulk assign Category/Member for non-split items.
4. **Validation**: Import older DB as read-only reference to test rule accuracy.
5. **Dashboard**:
   - Monthly Spend vs. Average.
   - Breakdown by Person (Your Personal Spend vs. Wife's Personal Spend vs. Joint Living).

#### 4. Settlement & Balances (Read-Only Visualization)
- **Logic**:
    - Purely calculates `Net Balance` between Members based on the ledger:
      `Balance = (Sum of Expenses Paid by X for Y) - (Sum of Transfers from Y to X)`
    - **No Synthetic Transactions**: The system does NOT create "Transfer" records.
- **Workflow**:
    1.  User views "Who Owes Who".
    2.  User makes a real-world bank transfer.
    3.  **Settlement**: When the transfer appears in the *next CSV upload*, it is categorized as "Settlement/Transfer".
    4.  The `Net Balance` automatically updates to 0 (or near 0).
- **Visualization**:
    - "Who Owes Who" graph.
    - Options to "Ignore/Hide" debts prior to a certain date (Checkpointing) if the math drifts over years, but primary truth is the ledger.

#### 6. Categorization Logic (Rules Engine)
- **Rule Design**:
    - `pattern` (Regex/Keyword), `category_id`, `priority` (to handle conflicts).
    - Stored in `ExtractionPattern.config` (Json).
    - Auto-run on upload.
- **Manual Override**: UI to correct mis-categorized items.

## Testing Strategy & Validation
> [!NOTE]
> Utilizing 4 years of historical data for robust validation.

- **Unit Tests**:
  - Jest/Vitest for parsing logic (ensure "Chase" CSVs and "BoA" CSVs parse correctly).
  - Categorization rule logic testing.
- **Integration Tests**:
  - Upload flow -> Database entry.
  - Dashboard calculations (checking sums against known totals).
- **Data Validation (Historical Data)**:
  - We will use your 4 years of existing CSVs as the "Golden Dataset".
  - **Regression Testing**: Ensure new rules don't break old categorizations.

## Implementation Steps
1. **Setup**: Initialize Next.js + SQLite (Completed).
2. **Infrastructure**:
   - create `setup.sh` / `update.sh` (Completed).
3. **Database**: Define Schema (Prisma) (Completed).
4. **Seed Data**: Create `prisma/seed.ts` (Next Step).
5. **Ingestion**: Build the flexible CSV parser.
6. **Testing**: Create test suite using a sample of your anonymized historical data.
7. **Categorization**: Build the Rules Engine.
8. **Dashboard**: Build the visualization reporting view.

