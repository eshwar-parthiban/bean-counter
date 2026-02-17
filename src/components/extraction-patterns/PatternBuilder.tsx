"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { Card, Button, Input, Label, Select, cn } from "@/components/ui";
import { Upload, Table as TableIcon, Save, ArrowRight, CheckCircle2 } from "lucide-react";
import { createExtractionPattern } from "@/lib/actions/extraction-patterns";
import { useRouter } from "next/navigation";

interface PatternBuilderProps {
    accounts: { id: string; name: string; bankName: string }[];
}

export default function PatternBuilder({ accounts }: PatternBuilderProps) {
    const router = useRouter();
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [skipHeaderLines, setSkipHeaderLines] = useState(0);
    const [mapping, setMapping] = useState({
        date: "",
        description: "",
        amount: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: false,
                skipEmptyLines: true,
                complete: (results) => {
                    setCsvData(results.data as any[]);
                },
            });
        }
    }, []);

    const processedData = useMemo(() => {
        if (csvData.length === 0) return [];
        const dataAfterSkip = csvData.slice(skipHeaderLines);
        if (dataAfterSkip.length === 0) return [];

        const currentHeaders = dataAfterSkip[0] as string[];
        setHeaders(currentHeaders);

        return dataAfterSkip.slice(1).map((row: any[]) => {
            const obj: any = {};
            currentHeaders.forEach((header, index) => {
                obj[header] = row[index];
            });
            return obj;
        });
    }, [csvData, skipHeaderLines]);

    const previewData = useMemo(() => {
        return processedData.slice(0, 5).map((row) => ({
            date: row[mapping.date] || "—",
            description: row[mapping.description] || "—",
            amount: row[mapping.amount] || "—",
        }));
    }, [processedData, mapping]);

    const handleSave = async () => {
        if (!selectedAccountId || !mapping.date || !mapping.description || !mapping.amount) {
            alert("Please select an account and map all required fields.");
            return;
        }

        setIsSaving(true);
        try {
            await createExtractionPattern({
                accountId: selectedAccountId,
                config: {
                    skipHeaderLines,
                    columnMapping: mapping,
                },
            });
            router.push(`/`); // Push to dashboard
        } catch (error) {
            console.error("Failed to save pattern:", error);
            alert("Failed to save pattern. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
                {/* Configuration Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-5"
                >
                    <Card className="p-6 space-y-8 bg-zinc-900/50 backdrop-blur-xl border-zinc-800">
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10">
                                    <Upload className="w-5 h-5 text-indigo-400" />
                                </div>
                                1. Source Configuration
                            </h2>

                            <div className="space-y-2">
                                <Label>Target Account</Label>
                                <Select
                                    value={selectedAccountId}
                                    onChange={(e) => setSelectedAccountId(e.target.value)}
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

                            <div className="space-y-2">
                                <Label>Sample CSV File</Label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={onFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={cn(
                                        "border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 bg-zinc-800/10",
                                        csvData.length > 0
                                            ? "border-emerald-500/50 bg-emerald-500/5"
                                            : "border-zinc-700 group-hover:border-indigo-500/50"
                                    )}>
                                        {csvData.length > 0 ? (
                                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                                        ) : (
                                            <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3 group-hover:text-indigo-400" />
                                        )}
                                        <p className={cn(
                                            "text-sm font-medium",
                                            csvData.length > 0 ? "text-emerald-400" : "text-zinc-400"
                                        )}>
                                            {csvData.length > 0 ? "CSV Data Loaded" : "Drop CSV here or click to browse"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Header Lines to Skip</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={skipHeaderLines}
                                    onChange={(e) => setSkipHeaderLines(parseInt(e.target.value) || 0)}
                                    className="bg-zinc-800/50 border-zinc-700 font-mono"
                                />
                                <p className="text-xs text-zinc-500 italic">Number of rows to ignore BEFORE the header row.</p>
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-zinc-800">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10">
                                    <ArrowRight className="w-5 h-5 text-indigo-400" />
                                </div>
                                2. Column Mapping
                            </h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Transaction Date</Label>
                                    <Select
                                        value={mapping.date}
                                        onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                                        disabled={headers.length === 0}
                                        className="bg-zinc-800/50 border-zinc-700"
                                    >
                                        <option value="">Select column...</option>
                                        {headers.map((h) => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Select
                                        value={mapping.description}
                                        onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                                        disabled={headers.length === 0}
                                        className="bg-zinc-800/50 border-zinc-700"
                                    >
                                        <option value="">Select column...</option>
                                        {headers.map((h) => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Value / Amount</Label>
                                    <Select
                                        value={mapping.amount}
                                        onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                                        disabled={headers.length === 0}
                                        className="bg-zinc-800/50 border-zinc-700"
                                    >
                                        <option value="">Select column...</option>
                                        {headers.map((h) => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Preview Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-7 flex flex-col gap-6"
                >
                    <Card className="p-6 flex-1 bg-zinc-900/50 backdrop-blur-xl border-zinc-800 flex flex-col">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-lg bg-indigo-500/10">
                                <TableIcon className="w-5 h-5 text-indigo-400" />
                            </div>
                            Live Preview
                        </h2>

                        <div className="flex-1 min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {csvData.length > 0 ? (
                                    <motion.div
                                        key="table"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/20"
                                    >
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs uppercase bg-white/5 text-zinc-400">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold">Date</th>
                                                    <th className="px-6 py-4 font-semibold">Description</th>
                                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                                {previewData.map((row, i) => (
                                                    <motion.tr
                                                        key={i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="hover:bg-white/5 transition-colors group"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-zinc-400 group-hover:text-white transition-colors">{row.date}</td>
                                                        <td className="px-6 py-4 max-w-xs truncate group-hover:text-white transition-colors">{row.description}</td>
                                                        <td className="px-6 py-4 font-mono text-indigo-400 font-medium">{row.amount}</td>
                                                    </motion.tr>
                                                ))}
                                                {previewData.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic">
                                                            No data available. Adjust "Lines to Skip" or check CSV format.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-800/5"
                                    >
                                        <div className="relative mb-6">
                                            <Upload className="w-16 h-16 opacity-10" />
                                            <TableIcon className="w-8 h-8 absolute -bottom-2 -right-2 opacity-20 text-indigo-500" />
                                        </div>
                                        <p className="text-lg font-medium text-zinc-400">Ready to Map</p>
                                        <p className="text-sm text-zinc-600 mt-1">Upload a sample CSV to start data extraction</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {csvData.length > 0 && (
                            <div className="mt-8 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 items-start">
                                <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400 mt-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    <strong className="text-indigo-300 block mb-1">Previewing First 5 Mapped Rows</strong>
                                    This table shows how your data will be extracted using the current mapping. Verify that the columns align correctly before saving.
                                </p>
                            </div>
                        )}
                    </Card>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !selectedAccountId || !mapping.date}
                        className="w-full h-16 text-lg font-semibold shadow-2xl relative overflow-hidden group rounded-2xl"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {isSaving ? "Creating Extraction Pattern..." : "Save Extraction Pattern"}
                            {!isSaving && <Save className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}
