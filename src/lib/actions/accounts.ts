"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AccountType, Currency } from "@prisma/client";

export async function getAccounts() {
    return await prisma.account.findMany({
        include: { member: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function createAccount(data: {
    name: string;
    bankName: string;
    accountNumber: string;
    nickname?: string;
    currency: Currency;
    type: AccountType;
    memberId: string;
}) {
    const account = await prisma.account.create({
        data,
    });
    revalidatePath("/");
    return account;
}

export async function updateAccount(
    id: string,
    data: {
        name: string;
        bankName: string;
        accountNumber: string;
        nickname?: string;
        currency: Currency;
        type: AccountType;
        memberId: string;
    }
) {
    const account = await prisma.account.update({
        where: { id },
        data,
    });
    revalidatePath("/");
    return account;
}

export async function deleteAccount(id: string) {
    await prisma.account.delete({
        where: { id },
    });
    revalidatePath("/");
}
