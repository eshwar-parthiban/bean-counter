# Why Prisma Configuration Failed (and how it was fixed)

The main issue stemmed from how **Prisma 7** handles configuration when using **`prisma.config.ts`**.

## 1. `prisma.config.ts` vs `schema.prisma` conflict
By default, Prisma looks for connection details in `schema.prisma`. However, starting with Prisma 7, using a `prisma.config.ts` file fundamentally changes how the client is generated. It expects you to configure database connections via "Driver Adapters" in your code, rather than just pointing to a URL in the schema.

- **Initial Error**: The original `seed.ts` tried to use `new PrismaClient()` without arguments, but the generated client (due to `prisma.config.ts`) required an `adapter` or explicit configuration because the `url` was missing/invalid in the schema context.

## 2. Invalid Adapter Constructor
When we switched to using the `@prisma/adapter-better-sqlite3` package to fix this, we ran into a specific code error:

- **The Mistake**: We tried initializing the adapter with a `better-sqlite3` database instance:
  ```typescript
  // INCORRECT
  const db = new Database('dev.db')
  const adapter = new PrismaBetterSqlite3(db)
  ```

- **The Fix**: The `PrismaBetterSqlite3` adapter actually expects a configuration object with a `url` string property directly:
  ```typescript
  // CORRECt
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL
  })
  ```

## Summary
To fix it, we:
1. Installed the necessary adapter packages (`@prisma/adapter-better-sqlite3`, `better-sqlite3`).
2. Updated `schema.prisma` to include `previewFeatures = ["driverAdapters"]`.
3. Corrected the initialization code in `seed.ts` to pass the right configuration object to the adapter.
