"use client";

import Image from "next/image";

export default function Logo({ className = "", size = "lg" }: { className?: string; size?: "sm" | "md" | "lg" }) {
    const sizes = {
        sm: { width: 48, height: 24 },
        md: { width: 64, height: 32 },
        lg: { width: 96, height: 48 },
    };

    const { width, height } = sizes[size];

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                style={{
                    width,
                    height,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0.25rem",
                }}
            >
                <Image
                    src="/vortiq-retina.png"
                    alt="Vortiq Logo"
                    width={width}
                    height={height}
                    priority
                    className="object-contain object-center"
                />
            </div>
        </div>
    );
}
