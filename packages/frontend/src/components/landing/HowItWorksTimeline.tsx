import React from "react";
import { Timeline } from "@/components/ui/timeline";

export default function HowItWorksTimeline() {
    const data = [
        {
            title: "Input",
            content: (
                <div>
                    <p className="text-slate-400 text-sm md:text-base font-normal mb-8">
                        Provide your initial prompts or ideas.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-800/60 bg-slate-900/40">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                <span className="text-blue-400 font-bold">1</span>
                            </div>
                            <h4 className="text-white font-medium">Prompt Setup</h4>
                        </div>
                        <p className="text-sm text-slate-500">
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
                    <p className="text-slate-400 text-sm md:text-base font-normal mb-8">
                        AI refines your prompt for better results.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-800/60 bg-slate-900/40">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                                <span className="text-purple-400 font-bold">2</span>
                            </div>
                            <h4 className="text-white font-medium">Prompt Enhancement</h4>
                        </div>
                        <p className="text-sm text-slate-500">
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
                    <p className="text-slate-400 text-sm md:text-base font-normal mb-8">
                        Create media with Wan2.1 and others.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-800/60 bg-slate-900/40">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                                <span className="text-indigo-400 font-bold">3</span>
                            </div>
                            <h4 className="text-white font-medium">AI Generation</h4>
                        </div>
                        <p className="text-sm text-slate-500">
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
                    <p className="text-slate-400 text-sm md:text-base font-normal mb-8">
                        Review the generated assets.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-800/60 bg-slate-900/40">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                                <span className="text-cyan-400 font-bold">4</span>
                            </div>
                            <h4 className="text-white font-medium">Asset Review</h4>
                        </div>
                        <p className="text-sm text-slate-500">
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
                    <p className="text-slate-400 text-sm md:text-base font-normal mb-8">
                        Auto-publish to your social platforms.
                    </p>
                    <div className="glass-card rounded-2xl p-6 border border-slate-800/60 bg-slate-900/40">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
                                <span className="text-green-400 font-bold">5</span>
                            </div>
                            <h4 className="text-white font-medium">Social Distribution</h4>
                        </div>
                        <p className="text-sm text-slate-500">
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
