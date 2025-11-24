"use client";

import { motion } from "framer-motion";
import { BarChart3, Users, Shield, Activity, Home, Settings, Bell, Search } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function PreviewSection() {
    return (
        <section className="py-20 overflow-hidden">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Powerful Dashboard
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                        Get a bird's eye view of your society's operations with our intuitive and data-rich dashboard.
                    </p>
                </div>

                <div className="relative perspective-1000">
                    <motion.div
                        initial={{ opacity: 0, rotateX: 20, y: 50 }}
                        whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                        transition={{ duration: 1, type: "spring" }}
                        viewport={{ once: true }}
                        className="relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-sm overflow-hidden"
                    >
                        {/* Mock Browser/App Header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="ml-4 flex-1 max-w-md">
                                <div className="h-6 rounded-md bg-white/5 flex items-center px-3 text-xs text-muted-foreground">
                                    <Search className="w-3 h-3 mr-2" /> Search residents, payments...
                                </div>
                            </div>
                            <div className="flex items-center gap-3 ml-auto">
                                <Bell className="w-4 h-4 text-muted-foreground" />
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-green-400 to-violet-600" />
                            </div>
                        </div>

                        <div className="flex h-[500px]">
                            {/* Mock Sidebar */}
                            <div className="w-16 md:w-64 border-r border-white/10 bg-white/5 p-4 hidden md:flex flex-col gap-2">
                                <div className="mb-6 px-2">
                                    <Logo size="sm" />
                                </div>
                                {[
                                    { icon: Home, label: "Dashboard", active: true },
                                    { icon: Users, label: "Residents", active: false },
                                    { icon: Shield, label: "Security", active: false },
                                    { icon: Activity, label: "Activity", active: false },
                                    { icon: Settings, label: "Settings", active: false },
                                ].map((item, i) => (
                                    <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${item.active ? 'bg-green-500/10 text-green-400' : 'text-muted-foreground hover:bg-white/5'}`}>
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Mock Content */}
                            <div className="flex-1 p-6 bg-black/20 overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold">Overview</h3>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 rounded-md bg-white/5 text-xs text-muted-foreground border border-white/10">Last 7 Days</div>
                                        <div className="px-3 py-1 rounded-md bg-green-500 text-xs text-black font-medium">Export</div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {[
                                        { label: "Total Residents", value: "1,248", change: "+12%", color: "text-green-400" },
                                        { label: "Active Visitors", value: "42", change: "+5%", color: "text-violet-400" },
                                        { label: "Pending Requests", value: "8", change: "-2%", color: "text-yellow-400" },
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                                            <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                            <div className={`text-xs ${stat.color}`}>{stat.change} from last week</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Area */}
                                <div className="grid grid-cols-3 gap-4 h-full">
                                    <div className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10 h-64">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-sm font-medium">Visitor Traffic</div>
                                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-end justify-between h-40 gap-2 px-2">
                                            {[40, 65, 45, 80, 55, 70, 60, 90, 50, 65, 75, 60].map((h, i) => (
                                                <div key={i} className="w-full bg-gradient-to-t from-green-500/20 to-green-500/60 rounded-t-sm" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-1 p-4 rounded-xl bg-white/5 border border-white/10 h-64">
                                        <div className="text-sm font-medium mb-4">Recent Alerts</div>
                                        <div className="space-y-3">
                                            {[
                                                { title: "Gate A Access", time: "2m ago", type: "info" },
                                                { title: "Maintenance Due", time: "1h ago", type: "warning" },
                                                { title: "New Registration", time: "3h ago", type: "success" },
                                            ].map((alert, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                                    <div className={`w-2 h-2 rounded-full ${alert.type === 'info' ? 'bg-blue-400' : alert.type === 'warning' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                                    <div className="flex-1">
                                                        <div className="text-xs font-medium">{alert.title}</div>
                                                        <div className="text-[10px] text-muted-foreground">{alert.time}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Glow effect behind */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-green-500/20 blur-[100px] -z-10 rounded-full opacity-50" />
                </div>
            </div>
        </section>
    );
}
