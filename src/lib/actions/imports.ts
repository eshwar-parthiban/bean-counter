'use server';

import { prisma } from '@/lib/db';
import { saveRawFile } from '@/lib/storage';
import { parse } from 'csv-parse/sync';
import crypto from 'crypto';
import { Currency } from '@prisma/client';

export async function uploadCSV(formData: FormData) {
    const file = formData.get('file') as File;
    const accountId = formData.get('accountId') as string;
    const extractionPatternId = formData.get('extractionPatternId') as string;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    if (!accountId) {
        return { success: false, error: 'No account ID provided' };
    }

    // Verify account exists
    const account = await prisma.account.findUnique({
        where: { id: accountId },
    });

    if (!account) {
        return { success: false, error: 'Account not found' };
    }

    const content = await file.arrayBuffer();
    const buffer = Buffer.from(content);
    const text = buffer.toString('utf-8');

    // 4. Fetch the expected pattern for this account
    // Strict Validation Logic: Get the latest pattern
    let pattern = null;
    if (extractionPatternId) {
        pattern = await prisma.extractionPattern.findUnique({
            where: { id: extractionPatternId },
        });
    } else if (account) {
        pattern = await prisma.extractionPattern.findFirst({
            where: { accountId: account.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    if (!pattern) {
        return {
            success: false,
            error: `No extraction pattern found for ${account.name}. Please configure one in Settings.`
        };
    }

    // 5. Validate File against Pattern
    const config = (pattern.config as any) || {};
    const headerRowIndex = config.headerRowIndex ?? 0;
    const lines = text.split(/\r?\n/);

    if (lines.length <= headerRowIndex) {
        return { success: false, error: 'File is too short to contain a header row at index ' + headerRowIndex };
    }

    let records: string[][] = [];
    try {
        records = parse(lines.slice(0, headerRowIndex + 1).join('\n'), {
            skip_empty_lines: false,
            relax_column_count: true,
        }) as string[][];
    } catch (e) {
        return { success: false, error: 'Failed to parse CSV file structure.' };
    }

    if (!records[headerRowIndex]) {
        return { success: false, error: 'Could not identify header row.' };
    }

    const headers = records[headerRowIndex].map(h => h.trim());
    const mapping = config.columnMapping || {};
    const requiredColumns = [mapping.date, mapping.amount, mapping.description].filter(Boolean);

    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
        return {
            success: false,
            error: `Validation Failed: File is missing required columns: ${missingColumns.join(', ')}. Expected headers matching pattern created on ${new Date(pattern.createdAt).toLocaleDateString()}.`
        };
    }

    // 1. Archive file
    let rawFilePath: string;
    try {
        rawFilePath = await saveRawFile(file.name, buffer);
    } catch (err) {
        console.error('Failed to save file:', err);
        return { success: false, error: 'Failed to archive file' };
    }

    // 2. Create ImportJob
    const importJob = await prisma.importJob.create({
        data: {
            filename: file.name,
            accountId,
            rawFilePath,
            status: 'PROCESSING',
        },
    });

    try {
        // 3. Parse CSV
        // Config already loaded above as 'config'

        // Default behavior if no pattern: header is first line, data starts next
        // headerRowIndex is already defined above
        const dataStartRowIndex = config.dataStartRowIndex ?? (headerRowIndex + 1);
        const ignoredRowIndices = new Set(config.ignoredRowIndices || []);

        // Parse full content as array of arrays
        const records = parse(text, {
            skip_empty_lines: false, // Maintain row indices matching the UI
            relax_column_count: true,
        }) as string[][];

        if (records.length <= headerRowIndex) {
            throw new Error("CSV file is empty or header row index is out of bounds");
        }

        // headers is already defined above

        // 4. Extract Data
        const transactionsData: any[] = [];

        for (let i = dataStartRowIndex; i < records.length; i++) {
            if (ignoredRowIndices.has(i)) continue;

            const row = records[i];
            // Skip empty rows that might have been preserved
            if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

            const record: Record<string, string> = {};

            // Map row values to headers
            headers.forEach((header, index) => {
                if (index < row.length) {
                    record[header] = row[index];
                }
            });

            // Create Transaction Data
            const rawLine = JSON.stringify(record);
            const contentHash = crypto.createHash('sha256').update(rawLine + importJob.id).digest('hex');

            let date = new Date();
            let amount = 0;
            let description = 'Imported Transaction';

            if (config.columnMapping) {
                const { date: dateCol, amount: amountCol, description: descCol } = config.columnMapping;

                if (record[dateCol]) {
                    const parsedDate = new Date(record[dateCol]);
                    if (!isNaN(parsedDate.getTime())) {
                        date = parsedDate;
                    }
                }

                if (record[amountCol]) {
                    // Remove currency symbols and commas, keep negative signs
                    const amountStr = record[amountCol].replace(/[^\d.-]/g, '');
                    amount = parseFloat(amountStr) || 0;
                }

                if (record[descCol]) {
                    description = record[descCol];
                }
            }

            transactionsData.push({
                date,
                description,
                importJobId: importJob.id,
                rawData: record,
                contentHash,
                amount,
                currency: account.currency,
                amountGbp: account.currency === 'GBP' ? amount : 0,
                status: 'DRAFT' as const,
            });
        }

        // 5. Batch insert with duplicate prevention
        if (transactionsData.length > 0) {
            await (prisma.transaction as any).createMany({
                data: transactionsData,
                skipDuplicates: true,
            });
        }

        // 6. Update ImportJob status to COMPLETED
        await prisma.importJob.update({
            where: { id: importJob.id },
            data: { status: 'COMPLETED' },
        });

        return {
            success: true,
            importJobId: importJob.id,
            count: transactionsData.length
        };
    } catch (error) {
        console.error('Import processing failed:', error);

        await prisma.importJob.update({
            where: { id: importJob.id },
            data: { status: 'FAILED' },
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during processing'
        };
    }
}
