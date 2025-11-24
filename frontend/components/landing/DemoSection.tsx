"use client";

import { motion } from "framer-motion";
import {
    Shield,
    Users,
    CreditCard,
    Calendar,
    Bell,
    FileText,
    UserCheck,
    AlertCircle,
    TrendingUp,
    Lock,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    BarChart3,
    MessageSquare,
    Settings,
    Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
    {
        icon: Shield,
        title: "Visitor Management",
        description: "Digital visitor logs with photo capture, pre-approval system, and real-time entry/exit tracking",
        color: "from-green-400 to-emerald-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
        details: [
            "QR code-based visitor entry",
            "Photo verification system",
            "Delivery tracking (courier, food)",
            "Visitor history & analytics"
        ]
    },
    {
        icon: CreditCard,
        title: "Billing & Payments",
        description: "Automated billing, online payment gateway integration, and comprehensive financial tracking",
        color: "from-violet-400 to-purple-500",
        bgColor: "bg-violet-500/10",
        borderColor: "border-violet-500/20",
        details: [
            "Monthly maintenance auto-generation",
            "UPI, Net Banking, Card payments",
            "Payment history & receipts",
            "Automatic late fee calculation"
        ]
    },
    {
        icon: Bell,
        title: "Notice Board",
        description: "Digital notice board with priority levels, categories, and instant push notifications",
        color: "from-yellow-400 to-orange-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20",
        details: [
            "Society announcements",
            "Emergency alerts",
            "Meeting minutes",
            "Real-time notifications"
        ]
    },
    {
        icon: AlertCircle,
        title: "Complaint Tracking",
        description: "Comprehensive helpdesk system with photo attachments, priority levels, and status tracking",
        color: "from-red-400 to-pink-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        details: [
            "Plumbing, electrical, civil issues",
            "Photo/video attachments",
            "Staff assignment & tracking",
            "Resolution timeline & ratings"
        ]
    },
    {
        icon: Users,
        title: "Resident Directory",
        description: "Searchable resident database with flat-wise details and contact information",
        color: "from-blue-400 to-cyan-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        details: [
            "Flat-wise resident details",
            "Contact information",
            "Occupancy status",
            "Advanced search & filters"
        ]
    },
    {
        icon: Calendar,
        title: "Facility Booking",
        description: "Book common areas like clubhouse, gym, pool, and sports facilities with ease",
        color: "from-emerald-400 to-teal-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        details: [
            "Clubhouse & party hall booking",
            "Sports facilities (gym, pool)",
            "Time-based slot management",
            "Cancellation policies"
        ]
    },
    {
        icon: BarChart3,
        title: "Analytics & Reports",
        description: "Comprehensive analytics dashboard with financial reports and occupancy statistics",
        color: "from-indigo-400 to-blue-500",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/20",
        details: [
            "Collection reports",
            "Occupancy statistics",
            "Pending dues tracking",
            "Complaint analytics"
        ]
    },
    {
        icon: UserCheck,
        title: "Role-Based Access",
        description: "Secure authentication with different access levels for Admin, Committee, Residents, and Security",
        color: "from-fuchsia-400 to-purple-500",
        bgColor: "bg-fuchsia-500/10",
        borderColor: "border-fuchsia-500/20",
        details: [
            "Admin: Full system access",
            "Committee: Manage operations",
            "Resident: View & interact",
            "Security: Visitor management"
        ]
    }
];

const stats = [
    { label: "Active Residents", value: "1,248", icon: Users, color: "text-green-400" },
    { label: "Monthly Transactions", value: "₹12.5L", icon: TrendingUp, color: "text-violet-400" },
    { label: "Visitor Entries", value: "3,420", icon: Shield, color: "text-yellow-400" },
    { label: "Resolved Complaints", value: "98%", icon: CheckCircle2, color: "text-emerald-400" },
];

export default function DemoSection() {
    return (
        <section id="demo" className="py-24 bg-background relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />

            {/* Gradient Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30" />

            <div className="container px-4 md:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-violet-500/10 border border-green-500/20 mb-6">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Complete Feature Overview</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Experience the{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-500 to-violet-600">
                            Full Power
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        Vortiq brings together all essential society management tools in one beautiful, intuitive platform.
                        Explore our comprehensive feature set designed specifically for Indian apartment complexes.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20"
                >
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-2xl bg-card border border-white/10 hover:border-white/20 transition-all group hover:shadow-2xl"
                        >
                            <stat.icon className={`w-8 h-8 mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                            <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className={`p-6 rounded-2xl bg-card border ${feature.borderColor} hover:border-opacity-50 transition-all group hover:shadow-2xl hover:-translate-y-1`}
                        >
                            <div className={`mb-4 p-3 rounded-xl w-fit ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-6 h-6 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                {feature.description}
                            </p>
                            <ul className="space-y-2">
                                {feature.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Admin Login Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-violet-500/10 border border-green-500/20 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />

                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full filter blur-3xl opacity-30" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full filter blur-3xl opacity-30" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <Lock className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold">Try the Demo</h3>
                                    <p className="text-muted-foreground">Login with admin credentials to explore all features</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Admin Credentials */}
                                <div className="p-6 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-sm font-semibold text-green-400">ADMIN ACCESS</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider">Username</label>
                                            <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm">
                                                admin
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider">Password</label>
                                            <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm">
                                                admin123
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <p className="text-xs text-green-400 flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>Full access to all features including resident management, billing, and analytics</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Resident Credentials */}
                                <div className="p-6 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                                        <span className="text-sm font-semibold text-violet-400">RESIDENT ACCESS</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider">Username</label>
                                            <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm">
                                                resident
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider">Password</label>
                                            <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm">
                                                resident123
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                        <p className="text-xs text-violet-400 flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>Access to notices, complaints, bills, and facility bookings</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Access Features */}
                            <div className="mb-8">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                    What You Can Explore
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { icon: Home, label: "Dashboard", color: "text-green-400" },
                                        { icon: Users, label: "Residents", color: "text-violet-400" },
                                        { icon: Shield, label: "Visitors", color: "text-yellow-400" },
                                        { icon: CreditCard, label: "Billing", color: "text-emerald-400" },
                                        { icon: Bell, label: "Notices", color: "text-blue-400" },
                                        { icon: AlertCircle, label: "Complaints", color: "text-red-400" },
                                        { icon: Calendar, label: "Bookings", color: "text-fuchsia-400" },
                                        { icon: Settings, label: "Settings", color: "text-cyan-400" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                            <item.icon className={`w-4 h-4 ${item.color}`} />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/login" className="w-full sm:w-auto">
                                    <Button
                                        size="lg"
                                        className="w-full h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold border-0 rounded-full text-base shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all"
                                    >
                                        Login to Demo <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/register" className="w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full h-14 px-8 rounded-full text-base border-white/10 hover:bg-white/5 hover:text-green-400 transition-colors"
                                    >
                                        Create Free Account
                                    </Button>
                                </Link>
                            </div>

                            {/* Security Note */}
                            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                <p className="text-xs text-yellow-400 text-center flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Demo credentials are for testing purposes only. Create your own account for production use.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
