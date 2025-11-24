"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
    {
        name: "Standard",
        price: "$50",
        period: "/month",
        description: "Essential tools for small to medium societies.",
        features: [
            { name: "Visitor Management", included: true },
            { name: "Maintenance Payments", included: true },
            { name: "Notice Board", included: true },
            { name: "Helpdesk Support", included: true },
            { name: "Facility Booking", included: false },
            { name: "Accounting & Reports", included: false },
            { name: "API Access", included: false },
            { name: "Custom Branding", included: false },
        ],
        highlight: false,
        buttonVariant: "outline" as const,
    },
    {
        name: "Premium",
        price: "$100",
        period: "/month",
        description: "Advanced features for modern, smart communities.",
        features: [
            { name: "Visitor Management", included: true },
            { name: "Maintenance Payments", included: true },
            { name: "Notice Board", included: true },
            { name: "Priority Support", included: true },
            { name: "Facility Booking", included: true },
            { name: "Accounting & Reports", included: true },
            { name: "API Access", included: true },
            { name: "Custom Branding", included: true },
        ],
        highlight: true,
        buttonVariant: "default" as const,
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-black/20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                        Choose the plan that fits your community's needs. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className={`relative p-8 rounded-3xl border ${plan.highlight ? 'border-green-500/50 bg-green-950/10 shadow-2xl shadow-green-500/10' : 'border-white/10 bg-white/5'} flex flex-col`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-black text-xs font-bold flex items-center gap-1 shadow-lg">
                                    <Sparkles className="w-3 h-3" /> MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                </div>
                                <p className="text-muted-foreground text-sm">{plan.description}</p>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {feature.included ? (
                                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-green-400" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <X className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                        )}
                                        <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground line-through opacity-50'}`}>
                                            {feature.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={`w-full h-12 rounded-xl font-semibold text-lg ${plan.highlight ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black border-0' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                                Choose {plan.name}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
