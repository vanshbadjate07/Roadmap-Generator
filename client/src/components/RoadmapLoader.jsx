import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const RoadmapLoader = ({ topic }) => {
    const [step, setStep] = useState(0);

    const steps = [
        `Analyzing the landscape of ${topic || "your topic"}...`,
        "Identifying key concepts and dependencies...",
        "Structuring milestones for optimal learning...",
        "Curating top-tier resources and projects...",
        "Finalizing your personalized mastery path..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500); // Change text every 1.5s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
            {/* Visual Animation Container */}
            <div className="relative w-64 h-64 mb-8 flex items-center justify-center">

                {/* 1. Pulsing Core */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="w-16 h-16 bg-primary/10 rounded-full blur-xl animate-ping opacity-50"></div>
                </div>

                {/* 2. SVG Path Drawing Animation */}
                <svg className="absolute inset-0 w-full h-full text-primary" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Path Line */}
                    <path
                        d="M50 20 L50 40 L30 60 L70 80"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-path"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            from="100"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                            fill="freeze"
                        />
                    </path>

                    {/* Nodes appearing */}
                    <circle cx="50" cy="20" r="3" fill="currentColor" className="animate-pop-in-1" />
                    <circle cx="50" cy="40" r="3" fill="currentColor" className="animate-pop-in-2" />
                    <circle cx="30" cy="60" r="3" fill="currentColor" className="animate-pop-in-3" />
                    <circle cx="70" cy="80" r="3" fill="currentColor" className="animate-pop-in-4" />
                </svg>

                {/* Central Icon */}
                <div className="relative z-10 bg-dark border border-primary/30 p-4 rounded-2xl shadow-2xl shadow-primary/20">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            </div>

            {/* Dynamic Text */}
            <div className="text-center max-w-md px-4">
                <h2 className="text-2xl font-bold font-heading text-white mb-3 flex items-center justify-center gap-2">
                    <Sparkles className="text-primary animate-pulse" size={20} />
                    Building Roadmap
                </h2>
                <div className="h-16 flex items-center justify-center">
                    <p className="text-gray-300 text-lg font-light transition-all duration-500 animate-fade-in-up key={step}">
                        {steps[step]}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-300 ease-out"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                ></div>
            </div>
        </div>
    );
};

export default RoadmapLoader;
