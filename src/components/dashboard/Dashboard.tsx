"use client";

import { useState } from "react";
import { Users, CreditCard, Tag, Plus, Pencil, Trash2, Building2, User } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { MemberForm } from "@/components/forms/MemberForm";
import { AccountForm } from "@/components/forms/AccountForm";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "members" | "accounts" | "categories";

export function Dashboard({
    initialMembers,
    initialAccounts,
    initialCategories
}: {
    initialMembers: any[];
    initialAccounts: any[];
    initialCategories: any[];
}) {
    const [activeTab, setActiveTab] = useState<Tab>("members");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const openAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        Management
                    </h1>
                    <p className="text-zinc-400 mt-1">Manage your team, finances and organization.</p>
                </div>
                <Button onClick={openAddModal} className="h-12 px-6 text-lg">
                    <Plus size={20} />
                    <span>Add New</span>
                </Button>
            </div>

            <div className="flex p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-fit">
                <TabButton
                    active={activeTab === "members"}
                    onClick={() => setActiveTab("members")}
                    icon={<Users size={18} />}
                    label="Members"
                />
                <TabButton
                    active={activeTab === "accounts"}
                    onClick={() => setActiveTab("accounts")}
                    icon={<CreditCard size={18} />}
                    label="Accounts"
                />
                <TabButton
                    active={activeTab === "categories"}
                    onClick={() => setActiveTab("categories")}
                    icon={<Tag size={18} />}
                    label="Categories"
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "members" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {initialMembers.map(member => (
                                <Card key={member.id} className="p-6 group hover:border-indigo-500/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white text-lg">{member.name}</h3>
                                                <p className="text-zinc-500 text-sm">@{member.nickname || member.name.toLowerCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" className="p-2" onClick={() => openEditModal(member)}>
                                                <Pencil size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === "accounts" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {initialAccounts.map(account => (
                                <Card key={account.id} className="p-6 border-l-4 border-l-indigo-500">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{account.name}</h3>
                                                <p className="text-zinc-500 text-sm">{account.bankName}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" className="p-2" onClick={() => openEditModal(account)}>
                                                <Pencil size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                        <div className="bg-white/5 rounded-xl p-3">
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Currency</span>
                                            <p className="text-white font-medium">{account.currency}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3">
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Type</span>
                                            <p className="text-white font-medium capitalize">{account.type.toLowerCase()}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3">
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Owner</span>
                                            <p className="text-white font-medium truncate">{account.member.name}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === "categories" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {initialCategories.map(category => (
                                <Card key={category.id} className="p-4 group relative flex items-center justify-between gap-2 overflow-visible">
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
                                            <Tag size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-300 truncate">{category.name}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all absolute -top-2 -right-2">
                                        <Button variant="secondary" className="p-1.5 rounded-full shadow-lg" onClick={() => openEditModal(category)}>
                                            <Pencil size={12} />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
            >
                {activeTab === "members" && <MemberForm initialData={editingItem} onSuccess={closeModal} />}
                {activeTab === "accounts" && <AccountForm members={initialMembers} initialData={editingItem} onSuccess={closeModal} />}
                {activeTab === "categories" && <CategoryForm initialData={editingItem} onSuccess={closeModal} />}
            </Modal>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300
        ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500 hover:text-white"}
      `}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}
