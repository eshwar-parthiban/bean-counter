import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden", className)}>
            {children}
        </div>
    );
}

export function Button({
    children,
    className,
    variant = "primary",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
    const variants = {
        primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25",
        secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/20",
        danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30",
        ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
    };

    return (
        <button
            className={cn(
                "px-4 py-2 rounded-xl transition-all duration-200 font-medium active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white",
                className
            )}
            {...props}
        />
    );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <label className={cn("text-sm font-medium text-zinc-400 mb-1.5 block", className)}>
            {children}
        </label>
    );
}

export function Select({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(
                "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white appearance-none cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </select>
    );
}
