"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createExtractionPattern(data: {
    accountId: string;
    config: any;
}) {
    const pattern = await prisma.extractionPattern.create({
        data,
    });
    revalidatePath("/accounts/[id]", "page");
    return pattern;
}

export async function getExtractionPatterns(accountId: string) {
    return await prisma.extractionPattern.findMany({
        where: { accountId },
        orderBy: { createdAt: "desc" },
    });
}
