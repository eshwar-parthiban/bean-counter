'use server';

import { prisma } from '@/lib/db';
import { saveRawFile } from '@/lib/storage';
import { parse } from 'csv-parse/sync';
import crypto from 'crypto';
import { Currency } from '@prisma/client';

export async function uploadCSV(formData: FormData) {
    const file = formData.get('file') as File;
    const accountId = formData.get('accountId') as string;

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
        // We use csv-parse to split the file into lines correctly handling quotes.
        const records = parse(text, {
            columns: false,
            skip_empty_lines: true,
            raw: true, // Important: allows us to get the original raw line
        });

        // 4. Prepare transactions for batch insert
        // We use the account's currency as a default.
        // Since we don't have mapping yet, we use placeholders for required fields.
        // These will be updated later by Agent 4 (Transaction Categorization).
        const transactionsData = records.map((record: any) => {
            const rawLine = record.raw?.trim();
            if (!rawLine) return null;

            const contentHash = crypto.createHash('sha256').update(rawLine).digest('hex');

            return {
                date: new Date(), // Placeholder: will be parsed later
                description: 'Raw Import line: ' + (rawLine.length > 50 ? rawLine.substring(0, 47) + '...' : rawLine),
                importJobId: importJob.id,
                rawData: {
                    line: rawLine,
                    fields: record.record
                },
                contentHash,
                amount: 0, // Placeholder: will be parsed later
                currency: account.currency,
                amountGbp: 0, // Placeholder
                status: 'DRAFT' as const,
            };
        }).filter((t): t is NonNullable<typeof t> => t !== null);

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
