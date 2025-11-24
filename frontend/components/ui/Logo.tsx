"use client";

import { motion } from "framer-motion";

export default function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
    const sizes = {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-lg",
        lg: "w-12 h-12 text-2xl",
    };

    const textSizes = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl",
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`${sizes[size]} rounded-lg bg-gradient-to-br from-green-400 to-violet-600 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300 shadow-lg shadow-green-500/20`}>
                <span className="text-black font-bold font-sans">V</span>
            </div>
            <span className={`${textSizes[size]} font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-violet-500 tracking-tight`}>
                Vortiq
            </span>
        </div>
    );
}
