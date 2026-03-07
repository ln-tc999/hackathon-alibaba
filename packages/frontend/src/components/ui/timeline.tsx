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
                            {/* Timeline Bullet Point - Simple Circle */}
                            <div className="relative flex items-center justify-center md:absolute md:left-0 md:top-0">
                                {/* Circle with gradient */}
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#0446ff] to-blue-600 flex items-center justify-center shadow-lg shadow-[#0446ff]/30 z-10">
                                    {/* Number */}
                                    <span className="text-sm md:text-base font-bold text-white">
                                        {index + 1}
                                    </span>
                                </div>
                            </div>
                            <h3 className="hidden md:block text-xl md:pl-20 md:text-4xl font-bold text-slate-900">
                                {item.title}
                            </h3>
                        </div>

                        <div className="relative pl-20 md:pl-24 pr-4 md:pr-8 w-full">
                            <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-slate-900">
                                {item.title}
                            </h3>
                            {item.content}
                        </div>
                    </div>
                ))}
                {/* Timeline Line - Aligned with bullet points center */}
                <div
                    className="absolute left-[21px] md:left-[25px] top-0"
                    style={{ height: `${height}px` }}
                >
                    {/* Background line */}
                    <div className="absolute inset-x-0 top-0 w-[3px] bg-slate-300 h-full" />
                    {/* Animated progress line */}
                    <motion.div
                        className="absolute inset-x-0 top-0 w-[3px] bg-gradient-to-b from-[#0446ff] to-blue-600 shadow-md shadow-[#0446ff]/50"
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
