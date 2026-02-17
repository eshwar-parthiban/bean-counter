"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label, Select } from "@/components/ui";
import { createAccount, updateAccount } from "@/lib/actions/accounts";
import { useState } from "react";
import { AccountType, Currency, Member } from "@prisma/client";

const schema = z.object({
    name: z.string().min(2, "Name is required"),
    bankName: z.string().min(2, "Bank name is required"),
    accountNumber: z.string().min(2, "Account number is required"),
    nickname: z.string().optional(),
    currency: z.nativeEnum(Currency),
    type: z.nativeEnum(AccountType),
    memberId: z.string().min(1, "Member is required"),
});

type FormData = z.infer<typeof schema>;

export function AccountForm({
    members,
    initialData,
    onSuccess
}: {
    members: Member[];
    initialData?: any;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initialData?.name || "",
            bankName: initialData?.bankName || "",
            accountNumber: initialData?.accountNumber || "",
            nickname: initialData?.nickname || "",
            currency: initialData?.currency || Currency.GBP,
            type: initialData?.type || AccountType.CURRENT,
            memberId: initialData?.memberId || "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            if (initialData) {
                await updateAccount(initialData.id, data);
            } else {
                await createAccount(data);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input {...register("name")} placeholder="e.g. Personal Current" />
                    {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input {...register("bankName")} placeholder="e.g. HSBC" />
                    {errors.bankName && <p className="text-red-400 text-xs">{errors.bankName.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Account Number</Label>
                <Input {...register("accountNumber")} placeholder="e.g. ****1234" />
                {errors.accountNumber && <p className="text-red-400 text-xs">{errors.accountNumber.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select {...register("currency")}>
                        {Object.values(Currency).map(c => (
                            <option key={c} value={c} className="bg-zinc-900">{c}</option>
                        ))}
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Type</Label>
                    <Select {...register("type")}>
                        {Object.values(AccountType).map(t => (
                            <option key={t} value={t} className="bg-zinc-900">{t}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Member</Label>
                <Select {...register("memberId")}>
                    <option value="" className="bg-zinc-900">Select Member</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>
                    ))}
                </Select>
                {errors.memberId && <p className="text-red-400 text-xs">{errors.memberId.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Saving..." : initialData ? "Update Account" : "Add Account"}
            </Button>
        </form>
    );
}
