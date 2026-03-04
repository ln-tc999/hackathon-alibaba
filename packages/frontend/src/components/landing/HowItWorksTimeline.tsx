import React from "react";
import { Timeline } from "@/components/ui/timeline";

export default function HowItWorksTimeline() {
    const data = [
        {
            title: "Input",
            content: (
                <div>
                    <p className="text-slate-600 text-sm md:text-base font-normal mb-8">
                        Provide your initial prompts or ideas.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <h4 className="text-slate-900 font-medium">Prompt Setup</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                            Start by typing your envisioned concept. "A futuristic cyberpunk city at sunset..."
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: "Enhance",
            content: (
                <div>
                    <p className="text-slate-600 text-sm md:text-base font-normal mb-8">
                        AI refines your prompt for better results.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-bold">2</span>
                            </div>
                            <h4 className="text-slate-900 font-medium">Prompt Enhancement</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                            VlowGen's AI automatically enriches your prompt with detailed descriptors for lighting, style, and composition.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: "Generate",
            content: (
                <div>
                    <p className="text-slate-600 text-sm md:text-base font-normal mb-8">
                        Create media with Wan2.1 and others.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-bold">3</span>
                            </div>
                            <h4 className="text-slate-900 font-medium">AI Generation</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                            The workflow calls Alibaba Cloud's Model Studio APIs to construct high-quality, 1024x1024 visuals in seconds.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: "Output",
            content: (
                <div>
                    <p className="text-slate-600 text-sm md:text-base font-normal mb-8">
                        Review the generated assets.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                <span className="text-cyan-600 font-bold">4</span>
                            </div>
                            <h4 className="text-slate-900 font-medium">Asset Review</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                            Assets are passed down the pipeline where they can be approved, filtered, or reformatted.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: "Post",
            content: (
                <div>
                    <p className="text-slate-600 text-sm md:text-base font-normal mb-8">
                        Auto-publish to your social platforms.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-bold">5</span>
                            </div>
                            <h4 className="text-slate-900 font-medium">Social Distribution</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                            The final output is automatically posted to your Twitter/X timeline using Composio integrations.
                        </p>
                    </div>
                </div>
            ),
        },
    ];
    return (
        <div className="w-full">
            <Timeline data={data} />
        </div>
    );
}
