"use client";

import { motion } from "framer-motion";
import { Users, Building2, Heart, Sparkles } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-green-500/30">
            <Navbar />

            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 -right-48 w-96 h-96 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-violet-500 bg-clip-text text-transparent">
                            About Vortiq
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Revolutionizing society management, one community at a time.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <div className="relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-xl border border-white/10 p-8 text-center group hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Building2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <h3 className="text-4xl font-bold mb-2">5</h3>
                            <p className="text-muted-foreground">Apartment Communities</p>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-xl border border-white/10 p-8 text-center group hover:border-emerald-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Users className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                            <h3 className="text-4xl font-bold mb-2">1000+</h3>
                            <p className="text-muted-foreground">Happy Residents</p>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-xl border border-white/10 p-8 text-center group hover:border-violet-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Heart className="w-12 h-12 mx-auto mb-4 text-violet-500" />
                            <h3 className="text-4xl font-bold mb-2">2</h3>
                            <p className="text-muted-foreground">Passionate Developers</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-xl border border-white/10 p-8 md:p-12"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl"></div>

                        <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-green-500" />
                            Our Story
                        </h2>

                        <div className="space-y-6 text-muted-foreground leading-relaxed relative z-10">
                            <p>
                                In the bustling heart of urban India, where apartment complexes rise like modern-day villages, a simple yet profound problem persisted. Residents struggled with outdated communication methods, administrators drowned in paperwork, and the sense of community that should bind neighbors together was slowly fading away. It was in this landscape that <span className="text-foreground font-semibold">Jagruti Patel</span>, a visionary entrepreneur with a passion for technology and community building, saw an opportunity to make a difference.
                            </p>

                            <p>
                                Jagruti had experienced these challenges firsthand while managing her own apartment community. Late-night emergency calls, lost maintenance requests, confusion over billing, and the constant struggle to keep everyone informed—these weren't just administrative headaches; they were barriers preventing communities from thriving. She knew there had to be a better way, a solution that could bring the efficiency of modern technology to the timeless need for connected communities.
                            </p>

                            <p>
                                With a clear vision and unwavering determination, Jagruti assembled a small but mighty team. Together with one talented developer who shared her passion for creating meaningful solutions, they embarked on a journey to build something extraordinary. Working late nights and weekends, fueled by countless cups of coffee and an unshakeable belief in their mission, they began crafting what would become <span className="text-green-500 font-semibold">Vortiq</span>.
                            </p>

                            <p>
                                The name "Vortiq" itself embodies their philosophy—a vortex of innovation and technology that draws communities together, creating a powerful center of connection and efficiency. From the very first line of code, they were committed to building more than just software; they were creating a platform that would transform how people experience community living.
                            </p>

                            <p>
                                The development process was intense but rewarding. Every feature was carefully designed with real residents in mind. The visitor management system came from Jagruti's own frustration with security lapses. The billing module was born from watching administrators struggle with spreadsheets. The complaint tracking system emerged from countless conversations with residents who felt their voices weren't being heard. Each component of Vortiq was a solution to a real problem, tested and refined through genuine user feedback.
                            </p>

                            <p>
                                Today, as CEO and Owner of Vortiq, Jagruti leads a platform that serves <span className="text-foreground font-semibold">5 apartment communities with over 1,000 residents</span>. But these numbers tell only part of the story. Behind each statistic are families who now feel more connected to their neighbors, administrators who can focus on building community instead of managing chaos, and security teams who can ensure everyone's safety with unprecedented efficiency.
                            </p>

                            <p>
                                What started as a solution to a personal pain point has blossomed into a movement. Vortiq isn't just changing how societies are managed—it's redefining what it means to be part of a community in the digital age. From instant alerts that keep everyone safe to event management that brings neighbors together, from transparent billing that builds trust to maintenance tracking that ensures every voice is heard, Vortiq is the invisible thread weaving modern communities closer together.
                            </p>

                            <p>
                                As we look to the future, our mission remains crystal clear: to empower every residential community with tools that don't just manage logistics, but nurture the human connections that make a house a home and neighbors a family. This is the Vortiq promise, and we're just getting started.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 px-4 pb-32">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            A small team with a big vision, dedicated to transforming community living.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 text-center group hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-4xl font-bold text-black">
                                    JP
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Jagruti Patel</h3>
                                <p className="text-green-500 font-semibold mb-4">CEO & Owner</p>
                                <p className="text-muted-foreground leading-relaxed">
                                    Visionary leader and founder of Vortiq, Jagruti combines deep technical expertise with a genuine passion for community building. Her hands-on approach and commitment to excellence drive every aspect of Vortiq's development and growth.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
