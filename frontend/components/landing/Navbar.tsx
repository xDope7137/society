"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="glass-nav rounded-full px-6 py-3 flex items-center gap-8 max-w-4xl w-full justify-between"
            >
                <Link href="/">
                    <Logo />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="#demo" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform">
                        Demo
                    </Link>
                    <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform">
                        Features
                    </Link>
                    <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform">
                        About
                    </Link>
                    <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 transform">
                        Contact
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/5">
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold border-0 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-shadow">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </motion.nav>
        </div>
    );
}
