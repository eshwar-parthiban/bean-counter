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

#### 2. Data Model (Schema Idea)
- **Member** (Dynamic Owners):
    - `id`, `name` (e.g. Eshwar, Deepshree, Joint) - *Seedable, extendable via DB*
- **Account**:
    - `id`, `name`, `currency` (GBP/INR/SGD), `member_id` (Default owner)
- **ImportJob** (Traceability):
    - `id`, `filename`, `status` (Processing, Completed), `raw_file_path`, `created_at`
- **Transaction**:
    - `id`, `import_job_id`, `raw_data_json` (Full row data from CSV)
    - `amount`, `currency`, `amount_gbp`
    - `status` (Enum: "Draft", "Posted")
    - `category_id` (Default), `type` (Expense, Transfer/Settlement), `assigned_to_member_id` (Default)
    - `is_split` (Boolean flag)
- **TransactionSplit** (Granular Allocation):
    - `id`, `transaction_id`
    - `amount`, `amount_gbp`
    - `category_id`, `assigned_to_member_id`
- **Category**:
    - `id`, `name`, `default_type` (Living/Personal)
- **ExtractionPattern**:
    - `id`, `account_id`, `config` (Header row, column mapping)

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

#### 5. Categorization Logic (Rules Engine)
- **Rule Design**:
    - `pattern` (Regex/Keyword), `category_id`, `priority` (to handle conflicts).
    - Auto-run on upload.
- **Manual Override**: UI to correct mis-categorized items, which optionally creates a new rule.

#### 6. Documentation & AI Context
- **Automated Docs**: TypeDoc for code documentation, auto-generated README updates.
- **AI Context Files**: `.cursorrules` / `agent.md` to help future AI assistants understand the project structure and conventions.

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
  - **Performance**: Verify the dashboard remains snappy with 4+ years of data.

## Release & Deployment Strategy
- **Deployment Target**:
  - **Primary**: Native Node.js process on your existing **Linux VM** (Minimizes RAM overhead).
  - **Process Management**: We will use `systemd` (or `pm2`) to keep the app running and restart it on boot.
- **Release Management**:
  1. **Development**: You work on `main` branch on your Mac.
  2. **Release**: Tag a version on GitHub.
  3. **Deploy**:
     - SSH into your Linux VM.
     - `git pull` the latest tag.
     - `npm install && npm run build`.
     - Restart the service (`sudo systemctl restart transaction-app`).
- **Data Persistence**:
  - The SQLite database file (`.db`) and `archive/` folder are just files on your VM disk. Easy to backup with `rsync` or any backup tool.

- **Scripts**:
  - `setup.sh`: Automated script to install dependencies (Node.js, PM2), clone repo, and setup `.env` on a fresh machine (Mac or Linux).
  - `update.sh`: Script to pull latest git tag, run migrations, rebuild, and restart the service.

## Implementation Steps
1. **Setup**: Initialize Next.js + SQLite.
2. **Infrastructure**:
   - create `setup.sh` (Dev/Prod setup).
   - create `update.sh` (One-click update).
   - create `systemd` service file.
3. **Database**: Define Schema (Prisma).
4. **Ingestion**: Build the flexible CSV parser.
5. **Testing**: Create test suite using a sample of your anonymized historical data.
6. **Categorization**: Build the Rules Engine.
7. **Dashboard**: Build the visualization reporting view.
