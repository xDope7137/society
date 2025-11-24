import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
    return (
        <footer className="py-16 border-t border-white/5 bg-background relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent blur-sm"></div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-6">
                            <Logo size="lg" />
                        </div>
                        <p className="text-muted-foreground max-w-xs text-lg">
                            Intelligent Living, Simplified. Empowering communities with smart technology.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-white">Product</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><a href="#features" className="hover:text-green-400 transition-colors">Features</a></li>
                            <li><a href="#pricing" className="hover:text-green-400 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Demo</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-white">Company</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
                            <li><Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Vortiq Society Management. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
