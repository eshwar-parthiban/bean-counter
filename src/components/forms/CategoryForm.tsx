"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@/components/ui";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { useState } from "react";

const schema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters"),
});

type FormData = z.infer<typeof schema>;

export function CategoryForm({
    initialData,
    onSuccess
}: {
    initialData?: { id: string; name: string };
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initialData?.name || "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            if (initialData) {
                await updateCategory(initialData.id, data);
            } else {
                await createCategory(data);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label>Category Name</Label>
                <Input {...register("name")} placeholder="e.g. Groceries" />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : initialData ? "Update Category" : "Add Category"}
            </Button>
        </form>
    );
}
