"use client";

import { motion } from "framer-motion";
import { Shield, Users, CreditCard, Calendar, Bell, Smartphone } from "lucide-react";

const features = [
    {
        icon: Shield,
        title: "Smart Security",
        description: "Advanced visitor management and gate security integration to keep your community safe.",
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
    },
    {
        icon: CreditCard,
        title: "Easy Payments",
        description: "Seamless maintenance bill payments and expense tracking for residents and admins.",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20"
    },
    {
        icon: Users,
        title: "Community Connect",
        description: "Foster a vibrant community with discussion forums, polls, and event management.",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        icon: Calendar,
        title: "Facility Booking",
        description: "Hassle-free booking for clubhouse, tennis courts, and other common amenities.",
        color: "text-fuchsia-400",
        bg: "bg-fuchsia-500/10",
        border: "border-fuchsia-500/20"
    },
    {
        icon: Bell,
        title: "Instant Notices",
        description: "Real-time alerts and digital notice board to keep everyone informed.",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
    },
    {
        icon: Smartphone,
        title: "Mobile First",
        description: "Access all features on the go with our fully responsive mobile application.",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20"
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-background relative">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Everything You Need
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                        Vortiq provides a comprehensive suite of tools to manage every aspect of your society.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-3xl bg-card border ${feature.border} hover:border-opacity-50 transition-all group hover:shadow-2xl hover:shadow-${feature.color.split('-')[1]}-500/10`}
                        >
                            <div className={`mb-6 p-4 rounded-2xl w-fit ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
