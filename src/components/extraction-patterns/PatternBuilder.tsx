"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { Card, Button, Input, Label, Select, cn } from "@/components/ui";
import { Upload, Table as TableIcon, Save, ArrowRight, CheckCircle2, AlertCircle, FileText, ChevronRight, X } from "lucide-react";
import { createExtractionPattern } from "@/lib/actions/extraction-patterns";
import { useRouter } from "next/navigation";

interface PatternBuilderProps {
    accounts: { id: string; name: string; bankName: string }[];
}

type Step = "UPLOAD" | "MARKING" | "MAPPING";

export default function PatternBuilder({ accounts }: PatternBuilderProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("UPLOAD");
    const [selectedAccountId, setSelectedAccountId] = useState("");

    // File State
    const [file, setFile] = useState<File | null>(null);
    const [rawRows, setRawRows] = useState<string[][]>([]);
    const [parseError, setParseError] = useState<string | null>(null);

    // Marking State
    const [ignoredRowIndices, setIgnoredRowIndices] = useState<Set<number>>(new Set());
    const [headerRowIndex, setHeaderRowIndex] = useState<number | null>(null);
    const [dataStartRowIndex, setDataStartRowIndex] = useState<number | null>(null);

    // Mapping State
    const [mapping, setMapping] = useState({
        date: "",
        description: "",
        amount: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    // ----------------------------------------------------------------------
    // STEP 1: UPLOAD HANDLERS
    // ----------------------------------------------------------------------
    const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            // Validate type
            if (!uploadedFile.name.endsWith('.csv')) {
                setParseError("Please upload a valid CSV file.");
                return;
            }

            setFile(uploadedFile);
            setParseError(null);

            Papa.parse(uploadedFile, {
                header: false,
                skipEmptyLines: false, // We want to see empty lines to mark them if needed
                preview: 20, // Only load first 20 lines for configuration
                complete: (results) => {
                    if (results.errors.length > 0) {
                        setParseError("Failed to parse CSV file.");
                        console.error(results.errors);
                    } else {
                        setRawRows(results.data as string[][]);
                        setCurrentStep("MARKING");
                    }
                },
                error: (error) => {
                    setParseError(`Error parsing file: ${error.message}`);
                }
            });
        }
    }, []);

    const clearFile = () => {
        setFile(null);
        setRawRows([]);
        setParseError(null);
        setCurrentStep("UPLOAD");
        // Reset markings
        setIgnoredRowIndices(new Set());
        setHeaderRowIndex(null);
        setDataStartRowIndex(null);
    };

    // ----------------------------------------------------------------------
    // STEP 2: MARKING LOGIC
    // ----------------------------------------------------------------------
    const toggleIgnoreRow = (index: number) => {
        const newSet = new Set(ignoredRowIndices);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
            // If we ignore a row, it can't be header or data start
            if (headerRowIndex === index) setHeaderRowIndex(null);
            if (dataStartRowIndex === index) setDataStartRowIndex(null);
        }
        setIgnoredRowIndices(newSet);
    };

    const setHeaderRow = (index: number) => {
        if (ignoredRowIndices.has(index)) return;
        setHeaderRowIndex(index === headerRowIndex ? null : index);
        // Header can't be data start
        if (dataStartRowIndex === index) setDataStartRowIndex(null);
    };

    const setDataStartRow = (index: number) => {
        if (ignoredRowIndices.has(index)) return;
        setDataStartRowIndex(index === dataStartRowIndex ? null : index);
        // Data start can't be header
        if (headerRowIndex === index) setHeaderRowIndex(null);
    };

    const getRowClass = (index: number) => {
        if (ignoredRowIndices.has(index)) return "bg-red-500/10 hover:bg-red-500/20";
        if (headerRowIndex === index) return "bg-blue-500/10 hover:bg-blue-500/20";
        if (dataStartRowIndex === index) return "bg-emerald-500/10 hover:bg-emerald-500/20";
        // If data start is set and this index is after it, highlight as data
        if (dataStartRowIndex !== null && index > dataStartRowIndex) return "bg-emerald-500/5 hover:bg-emerald-500/10";
        return "hover:bg-zinc-800/50";
    };

    const canProceedToMapping = selectedAccountId && headerRowIndex !== null && dataStartRowIndex !== null;

    // ----------------------------------------------------------------------
    // STEP 3: MAPPING LOGIC
    // ----------------------------------------------------------------------
    const headers = useMemo(() => {
        if (headerRowIndex === null) return [];
        return rawRows[headerRowIndex] || [];
    }, [rawRows, headerRowIndex]);

    const previewMappedData = useMemo(() => {
        if (headerRowIndex === null || dataStartRowIndex === null) return [];

        // Simulating extraction based on markings
        return rawRows.slice(dataStartRowIndex).filter((_, idx) => !ignoredRowIndices.has(dataStartRowIndex + idx)).map(row => {
            const dateIdx = headers.indexOf(mapping.date);
            const descIdx = headers.indexOf(mapping.description);
            const amountIdx = headers.indexOf(mapping.amount);

            return {
                date: row[dateIdx] || "—",
                description: row[descIdx] || "—",
                amount: row[amountIdx] || "—"
            };
        });
    }, [rawRows, headerRowIndex, dataStartRowIndex, ignoredRowIndices, mapping, headers]);

    const handleSave = async () => {
        if (!selectedAccountId || !mapping.date || !mapping.description || !mapping.amount) {
            return;
        }

        setIsSaving(true);
        try {
            await createExtractionPattern({
                accountId: selectedAccountId,
                config: {
                    headerRowIndex,
                    dataStartRowIndex,
                    ignoredRowIndices: Array.from(ignoredRowIndices),
                    columnMapping: {
                        date: mapping.date, // Store column name, logic will match by name
                        description: mapping.description,
                        amount: mapping.amount
                    },
                },
            });
            router.push(`/`);
        } catch (error) {
            console.error("Failed to save pattern:", error);
            alert("Failed to save pattern.");
        } finally {
            setIsSaving(false);
        }
    };

    // ----------------------------------------------------------------------
    // UI RENDERERS
    // ----------------------------------------------------------------------

    const renderUploadStep = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
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

            <div className="relative group">
                <input
                    type="file"
                    accept=".csv"
                    onChange={onFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                    "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 bg-zinc-900/50",
                    parseError ? "border-red-500/50 bg-red-500/5" : "border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50"
                )}>
                    <Upload className={cn("w-12 h-12 mx-auto mb-4", parseError ? "text-red-500" : "text-zinc-500")} />
                    <p className="text-lg font-medium text-zinc-300">
                        {parseError ? "Upload Failed" : "Drop CSV file here"}
                    </p>
                    <p className="text-sm text-zinc-500 mt-2">
                        {parseError || "or click to browse"}
                    </p>
                </div>
            </div>
        </motion.div>
    );

    const renderMarkingStep = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium text-zinc-300">{file?.name}</span>
                </div>
                <Button variant="ghost" onClick={clearFile} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4 mr-2" />
                    Change File
                </Button>
            </div>

            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 space-y-4">
                <div className="flex gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-zinc-400">Ignored Row</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-zinc-400">Header Row</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-zinc-400">First Data Row</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <tbody>
                            {rawRows.map((row, rowIndex) => (
                                <tr key={rowIndex} className={cn("transition-colors", getRowClass(rowIndex))}>
                                    <td className="p-2 border-b border-zinc-800 w-[1%]" align="right">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleIgnoreRow(rowIndex)}
                                                className={cn("w-6 h-6 rounded flex items-center justify-center hover:bg-white/10", ignoredRowIndices.has(rowIndex) ? "text-red-500" : "text-zinc-600")}
                                                title="Ignore Row"
                                            >
                                                <X size={14} />
                                            </button>
                                            <button
                                                onClick={() => setHeaderRow(rowIndex)}
                                                className={cn("w-6 h-6 rounded flex items-center justify-center hover:bg-white/10", headerRowIndex === rowIndex ? "text-blue-500" : "text-zinc-600")}
                                                title="Set as Header"
                                            >
                                                <TableIcon size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDataStartRow(rowIndex)}
                                                className={cn("w-6 h-6 rounded flex items-center justify-center hover:bg-white/10", dataStartRowIndex === rowIndex ? "text-emerald-500" : "text-zinc-600")}
                                                title="Set as First Data Row"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    {row.slice(0, 5).map((cell, cellIndex) => (
                                        <td key={cellIndex} className="p-3 border-b border-zinc-800 whitespace-nowrap text-zinc-300">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={() => setCurrentStep("MAPPING")}
                    disabled={!canProceedToMapping}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    Continue to Mapping
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );

    const renderMappingStep = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>Transaction Date</Label>
                    <Select
                        value={mapping.date}
                        onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                        className="bg-zinc-800/50 border-zinc-700"
                    >
                        <option value="">Select column...</option>
                        {headers.map((h, i) => (
                            <option key={i} value={h}>{h}</option>
                        ))}
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Select
                        value={mapping.description}
                        onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                        className="bg-zinc-800/50 border-zinc-700"
                    >
                        <option value="">Select column...</option>
                        {headers.map((h, i) => (
                            <option key={i} value={h}>{h}</option>
                        ))}
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Amount</Label>
                    <Select
                        value={mapping.amount}
                        onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                        className="bg-zinc-800/50 border-zinc-700"
                    >
                        <option value="">Select column...</option>
                        {headers.map((h, i) => (
                            <option key={i} value={h}>{h}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <Card className="p-0 overflow-hidden bg-zinc-900/50 border-zinc-800">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900">
                    <h3 className="text-sm font-medium text-zinc-400">Verification Preview (First 5 Rows)</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-900/50 text-zinc-500">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {previewMappedData.slice(0, 5).map((row, i) => (
                            <tr key={i} className="hover:bg-white/5">
                                <td className="px-6 py-3 text-zinc-300">{row.date}</td>
                                <td className="px-6 py-3 text-zinc-300">{row.description}</td>
                                <td className="px-6 py-3 font-mono text-indigo-400">{row.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <div className="flex justify-between pt-4">
                <Button
                    variant="secondary"
                    onClick={() => setCurrentStep("MARKING")}
                    className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                >
                    Back
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !mapping.date || !mapping.description || !mapping.amount}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]"
                >
                    {isSaving ? "Saving..." : "Save Pattern"}
                    {!isSaving && <CheckCircle2 className="w-4 h-4 ml-2" />}
                </Button>
            </div>
        </motion.div>
    );

    return (
        <Card className="p-6 md:p-8 bg-zinc-950 border border-zinc-900 shadow-2xl space-y-8 max-w-5xl mx-auto">
            {/* Wizard Steps */}
            <div className="flex items-center justify-between max-w-2xl mx-auto mb-12 relative">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-zinc-900 -z-10" />
                {(["UPLOAD", "MARKING", "MAPPING"] as Step[]).map((step, index) => {
                    const isActive = step === currentStep;
                    const isCompleted =
                        (step === "UPLOAD" && currentStep !== "UPLOAD") ||
                        (step === "MARKING" && currentStep === "MAPPING");

                    return (
                        <div key={step} className="flex flex-col items-center gap-3 bg-zinc-950 px-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                                isActive ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" :
                                    isCompleted ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" :
                                        "border-zinc-800 text-zinc-600 bg-zinc-900"
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                            </div>
                            <span className={cn(
                                "text-xs font-semibold tracking-wider transition-colors duration-300",
                                isActive ? "text-indigo-400" :
                                    isCompleted ? "text-emerald-500" :
                                        "text-zinc-600"
                            )}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {currentStep === "UPLOAD" && renderUploadStep()}
                {currentStep === "MARKING" && renderMarkingStep()}
                {currentStep === "MAPPING" && renderMappingStep()}
            </AnimatePresence>
        </Card>
    );
}
