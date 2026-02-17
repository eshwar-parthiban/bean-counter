"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { name: "asc" },
    });
}

export async function createCategory(data: { name: string }) {
    const category = await prisma.category.create({
        data,
    });
    revalidatePath("/");
    return category;
}

export async function updateCategory(id: string, data: { name: string }) {
    const category = await prisma.category.update({
        where: { id },
        data,
    });
    revalidatePath("/");
    return category;
}

export async function deleteCategory(id: string) {
    await prisma.category.delete({
        where: { id },
    });
    revalidatePath("/");
}
