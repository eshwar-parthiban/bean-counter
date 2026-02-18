"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Select, Label, cn } from "@/components/ui";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { uploadCSV } from "@/lib/actions/imports";
import { useRouter } from "next/navigation";

interface TransactionImporterProps {
    accounts: { id: string; name: string; bankName: string }[];
}

export default function TransactionImporter({ accounts }: TransactionImporterProps) {
    const router = useRouter();
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedAccountId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("accountId", selectedAccountId);

        try {
            const response = await uploadCSV(formData);
            if (response.success) {
                setResult({ success: true, count: response.count });
                // Optional: redirect after some time
            } else {
                setResult({ success: false, error: response.error });
            }
        } catch (error) {
            setResult({ success: false, error: "An unexpected error occurred." });
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
    };

    return (
        <Card className="max-w-xl mx-auto p-6 md:p-8 bg-zinc-950 border border-zinc-900 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Import Transactions</h1>
                <p className="text-zinc-400">Upload a CSV to import transactions relative to an account.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Target Account</Label>
                    <Select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        disabled={isUploading || !!result?.success}
                        className="bg-zinc-800/50 border-zinc-700"
                    >
                        <option value="">Select an account...</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.bankName} - {account.name}
                            </option>
                        ))}
                    </Select>
                </div>

                {!file ? (
                    <div className="relative group">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={onFileChange}
                            disabled={!selectedAccountId || isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <div className={cn(
                            "border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300",
                            !selectedAccountId ? "border-zinc-800 bg-zinc-900/20 opacity-50" :
                                "border-zinc-700 hover:border-indigo-500/50 hover:bg-zinc-800/50 bg-zinc-900/50"
                        )}>
                            <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3 group-hover:text-indigo-400 transition-colors" />
                            <p className="text-sm font-medium text-zinc-300">
                                {!selectedAccountId ? "Select an account first" : "Drop CSV file here"}
                            </p>
                            {selectedAccountId && (
                                <p className="text-xs text-zinc-500 mt-2">or click to browse</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">{file.name}</p>
                                    <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            {!isUploading && !result?.success && (
                                <Button variant="ghost" onClick={reset} className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10">
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {result?.success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Successfully imported {result.count} transactions!
                                </motion.div>
                            ) : result?.error ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {result.error}
                                </motion.div>
                            ) : (
                                <Button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Import Transactions"
                                    )}
                                </Button>
                            )}
                        </AnimatePresence>

                        {result?.success && (
                            <Button
                                className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                onClick={() => router.push('/')}
                            >
                                Go to Dashboard
                            </Button>
                        )}
                    </motion.div>
                )}
            </div>
        </Card>
    );
}
