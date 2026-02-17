"use client";

import Link from "next/link";
import { Settings, Home, Wallet, PieChart } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            B
                        </div>
                        <span>Bean Counter</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Home size={18} />
                            <span>Overview</span>
                        </Link>
                        <Link
                            href="/transactions"
                            className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Wallet size={18} />
                            <span>Transactions</span>
                        </Link>
                        <Link
                            href="/reports"
                            className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-2"
                        >
                            <PieChart size={18} />
                            <span>Reports</span>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/management"
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        title="Management"
                    >
                        <Settings size={22} />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
