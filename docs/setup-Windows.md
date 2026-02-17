# Windows 11 Setup Guide

This guide will help you set up the **Bean Counter** development environment on Windows 11.

## Prerequisites

Ensure you have the following installed on your Windows machine:

1.  **Node.js (v18 or newer)**
    *   Download from [nodejs.org](https://nodejs.org/)
    *   Verify by running `node -v` in PowerShell or CMD.
2.  **Git for Windows**
    *   Download from [git-scm.com](https://git-scm.com/)
3.  **Visual Studio Code (Recommended)**
    *   Extensions: **Prisma**, **Tailwind CSS IntelliSense**, **ESLint**.

## Quick Setup

1.  **Clone the Repository** (if you haven't already):
    ```powershell
    git clone https://github.com/eshwar-parthiban/bean-counter.git
    cd bean-counter
    ```

2.  **Run the Setup Script**:
    *   Double-click `setup-windows.bat` in File Explorer.
    *   *OR* run it in your terminal:
    ```powershell
    .\setup-windows.bat
    ```

## Manual Setup Steps

If you prefer to run the steps manually, follow these instructions in your terminal:

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Environment
Create a file named `.env` in the root directory:
```env
DATABASE_URL="file:./dev.db"
```

### 3. Database Initialisation
```powershell
# Create the local database and generate Prisma Client
npx prisma generate
npx prisma db push

# Seed the database with initial members and categories
npx prisma db seed
```

### 4. Start Development
```powershell
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

## Troubleshooting

### SQLite Build Issues
If you encounter issues with `better-sqlite3` during `npm install`, you may need the **Windows Build Tools**:
*   Run PowerShell as Administrator and run:
    ```powershell
    npm install --global --production windows-build-tools
    ```
*   Alternatively, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and select "Desktop development with C++".

### Execution Policy
If PowerShell blocks the setup script, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
