import { getAccounts } from "@/lib/actions/accounts";
import PatternBuilder from "@/components/extraction-patterns/PatternBuilder";
import { ArrowLeft, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "New Extraction Pattern | Bean Counter",
    description: "Configure how CSV files are parsed for your bank account",
};

export default async function NewExtractionPatternPage() {
    const accounts = await getAccounts();

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
            {/* Decorative Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-12 lg:py-20 space-y-12">
                <header className="space-y-6">
                    <nav className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                        <Link
                            href="/"
                            className="hover:text-white transition-colors flex items-center gap-1.5"
                        >
                            Dashboard
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-zinc-200">New Extraction Pattern</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                                    <Settings className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                                    Extraction <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Builder</span>
                                </h1>
                            </div>
                            <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                                Connect your bank statements to Bean Counter by mapping CSV columns to our transaction format.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Discard Changes
                        </Link>
                    </div>
                </header>

                <main>
                    <PatternBuilder accounts={accounts} />
                </main>

                <footer className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
                    <p>© 2024 Bean Counter. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-zinc-300 transition-colors">Help Documentation</a>
                        <a href="#" className="hover:text-zinc-300 transition-colors">Supported Banks</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
