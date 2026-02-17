"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getMembers() {
    return await prisma.member.findMany({
        orderBy: { name: "asc" },
    });
}

export async function createMember(data: { name: string; nickname?: string }) {
    const member = await prisma.member.create({
        data,
    });
    revalidatePath("/");
    return member;
}

export async function updateMember(id: string, data: { name: string; nickname?: string }) {
    const member = await prisma.member.update({
        where: { id },
        data,
    });
    revalidatePath("/");
    return member;
}

export async function deleteMember(id: string) {
    await prisma.member.delete({
        where: { id },
    });
    revalidatePath("/");
}
