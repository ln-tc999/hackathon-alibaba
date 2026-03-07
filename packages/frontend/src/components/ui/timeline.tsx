"use client";
import {
    useScroll,
    useTransform,
    motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
    title: string;
    content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setHeight(rect.height);
        }
    }, [ref]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 10%", "end 50%"],
    });

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    return (
        <div
            className="w-full font-sans"
            ref={containerRef}
        >
            <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-start pt-10 md:pt-20 md:gap-10"
                    >
                        <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                            {/* Timeline Bullet Point - Improved UI/UX */}
                            <div className="relative flex items-center justify-center md:absolute md:left-0 md:top-0">
                                {/* Outer circle with gradient */}
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#0446ff] to-blue-600 flex items-center justify-center shadow-xl shadow-[#0446ff]/30 border-4 border-white">
                                    {/* Inner circle */}
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center">
                                        {/* Number or icon */}
                                        <span className="text-lg md:text-xl font-bold text-[#0446ff]">
                                            {index + 1}
                                        </span>
                                    </div>
                                </div>
                                {/* Pulse animation ring */}
                                <div className="absolute inset-0 rounded-full border-2 border-[#0446ff]/30 animate-ping" />
                            </div>
                            <h3 className="hidden md:block text-xl md:pl-24 md:text-4xl font-bold text-slate-900">
                                {item.title}
                            </h3>
                        </div>

                        <div className="relative pl-24 md:pl-32 pr-4 md:pr-8 w-full">
                            <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-slate-900">
                                {item.title}
                            </h3>
                            {item.content}
                        </div>
                    </div>
                ))}
                {/* Timeline Line - Fixed positioning */}
                <div
                    className="absolute left-7 md:left-10 top-0 w-[4px]"
                    style={{ height: `${height}px` }}
                >
                    {/* Background line - subtle gray */}
                    <div className="absolute inset-x-0 top-0 w-[4px] bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 h-full rounded-full" />
                    {/* Animated progress line - blue gradient */}
                    <motion.div
                        className="absolute inset-x-0 top-0 w-[4px] bg-gradient-to-b from-[#0446ff] via-blue-500 to-indigo-600 rounded-full shadow-lg shadow-[#0446ff]/40"
                        initial={{ height: 0, opacity: 0 }}
                        style={{
                            height: heightTransform,
                            opacity: opacityTransform,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
