"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@/components/ui";
import { createMember, updateMember } from "@/lib/actions/members";
import { useState } from "react";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    nickname: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function MemberForm({
    initialData,
    onSuccess
}: {
    initialData?: { id: string; name: string; nickname?: string | null };
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initialData?.name || "",
            nickname: initialData?.nickname || "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            if (initialData) {
                await updateMember(initialData.id, data);
            } else {
                await createMember(data);
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
                <Label>Name</Label>
                <Input {...register("name")} placeholder="e.g. Eshwar" />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>Nickname (Optional)</Label>
                <Input {...register("nickname")} placeholder="e.g. Esh" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : initialData ? "Update Member" : "Add Member"}
            </Button>
        </form>
    );
}
