import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-green-500/30">
            <Navbar />

            <div className="container px-4 md:px-6 py-32 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-violet-500">
                    Privacy Policy
                </h1>

                <div className="prose prose-invert prose-green max-w-none space-y-8 text-muted-foreground">
                    <p className="text-lg leading-relaxed">
                        At Vortiq, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our society management application.
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                        <p>
                            We collect information that you provide directly to us when you register for an account, update your profile, or communicate with us. This may include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Personal identification information (Name, email address, phone number, apartment number).</li>
                            <li>Vehicle information for parking management.</li>
                            <li>Payment information for maintenance bill processing.</li>
                            <li>Visitor logs and gate entry data.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Provide, operate, and maintain our services.</li>
                            <li>Process transactions and send related information.</li>
                            <li>Manage visitor access and security protocols.</li>
                            <li>Send you technical notices, updates, security alerts, and support messages.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className="mt-2 text-green-400">privacy@vortiq.com</p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
