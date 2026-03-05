"use client";
import {
    useMotionValueEvent,
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
                            <div className="h-12 w-12 absolute left-0 md:left-3 rounded-none bg-white border-4 border-[#0446ff] flex items-center justify-center z-50 shadow-lg shadow-[#0446ff]/20">
                                <div className="h-5 w-5 rounded-none bg-[#0446ff]" />
                            </div>
                            <h3 className="hidden md:block text-xl md:pl-20 md:text-4xl font-bold text-slate-900">
                                {item.title}
                            </h3>
                        </div>

                        <div className="relative pl-20 pr-4 md:pl-4 w-full">
                            <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-slate-900">
                                {item.title}
                            </h3>
                            {item.content}
                        </div>
                    </div>
                ))}
                {/* Timeline Line */}
                <div
                    className="absolute left-6 md:left-9 top-0 overflow-hidden w-[3px] z-10"
                    style={{ height: `${height}px` }}
                >
                    {/* Background line */}
                    <div className="absolute inset-x-0 top-0 w-[3px] bg-slate-200 h-full" />
                    {/* Animated progress line */}
                    <motion.div
                        className="absolute inset-x-0 top-0 w-[3px] bg-gradient-to-b from-[#0446ff] via-blue-500 to-indigo-600 shadow-lg shadow-[#0446ff]/30"
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
