"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { Sun, Moon } from "lucide-react";

export default function Page() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle("dark");
    };

    // Particle System Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let animationFrameId: number;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        setCanvasSize();
        window.addEventListener("resize", setCanvasSize);

        class Particle {
            x: number = 0;
            y: number = 0;
            size: number = 0;
            speedX: number = 0;
            speedY: number = 0;
            color: string = "";

            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.color = isDarkMode
                    ? `rgba(255, 255, 255, ${Math.random() * 0.3})`
                    : `rgba(59, 130, 246, ${Math.random() * 0.2})`;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas!.width || this.x < 0 || this.y > canvas!.height || this.y < 0) {
                    this.reset();
                }
            }
            draw() {
                ctx!.fillStyle = this.color;
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fill();
            }
        }

        const particles = Array.from({ length: 80 }, () => new Particle());

        const animate = () => {
            ctx!.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            window.removeEventListener("resize", setCanvasSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode]);

    return (
        <div
            className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden relative ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
                }`}
        >
            {/* Background Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none z-0"
            />

            {/* Theme Toggle */}
            <button
                onClick={toggleDarkMode}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform z-20 shadow-xl"
            >
                {isDarkMode ? (
                    <Sun className="text-yellow-400" size={20} />
                ) : (
                    <Moon className="text-slate-700" size={20} />
                )}
            </button>

            {/* Login Card Wrapper */}
            <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700 flex justify-center">
                <SignIn
                    appearance={{
                        elements: {
                            card: `shadow-2xl backdrop-blur-xl ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
                                }`,
                            headerTitle: "text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent",
                            headerSubtitle: isDarkMode ? "text-slate-400" : "text-slate-500",
                            formButtonPrimary: "w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transform hover:-translate-y-1 active:scale-95 transition-all duration-200",
                            formFieldInput: `w-full px-4 py-3 bg-transparent border-b-2 outline-none transition-all duration-300 ${isDarkMode ? "border-slate-700 focus:border-blue-500 text-white" : "border-slate-300 focus:border-blue-500 text-slate-900"
                                }`,
                            formFieldLabel: isDarkMode ? "text-slate-400" : "text-slate-500",
                            dividerLine: isDarkMode ? "bg-slate-800" : "bg-slate-200",
                            dividerText: isDarkMode ? "text-slate-500" : "text-slate-400",
                            socialButtonsBlockButton: `rounded-xl border transition-all ${isDarkMode
                                    ? "border-slate-800 hover:bg-slate-800 text-white"
                                    : "border-slate-200 hover:bg-slate-100 text-slate-900"
                                }`,
                        },
                    }}
                />
            </div>
        </div>
    );
}
