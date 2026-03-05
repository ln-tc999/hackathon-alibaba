import React from "react";
import { Timeline } from "@/components/ui/timeline";

export default function HowItWorksTimeline() {
    const data = [
        {
            title: "1. Input Your Vision",
            content: (
                <div>
                    <p className="text-slate-600 text-base md:text-lg font-normal mb-8 leading-relaxed">
                        Start with a simple text prompt or idea. No technical skills required—just describe what you want to create.
                    </p>
                    <div className="glass-card rounded-none p-8 border border-slate-200 bg-white/60 shadow-lg">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-none bg-gradient-to-br from-[#0446ff] to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0446ff]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-slate-900 font-bold text-lg mb-2">Prompt Setup</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    Type your creative vision in natural language. Our AI understands context and intent.
                                </p>
                                <div className="bg-slate-50 rounded-none p-4 border-l-4 border-[#0446ff]">
                                    <p className="text-sm text-slate-700 font-mono">
                                        "A futuristic cyberpunk city at sunset with neon lights reflecting on wet streets..."
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>Takes ~5 seconds</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "2. AI Enhancement",
            content: (
                <div>
                    <p className="text-slate-600 text-base md:text-lg font-normal mb-8 leading-relaxed">
                        Qwen AI automatically enriches your prompt with professional details for optimal results.
                    </p>
                    <div className="glass-card rounded-none p-8 border border-slate-200 bg-white/60 shadow-lg">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-none bg-gradient-to-br from-[#0446ff] to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0446ff]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-slate-900 font-bold text-lg mb-2">Intelligent Prompt Enhancement</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    Our AI adds technical details like lighting, composition, style, and quality parameters automatically.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" className="mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        <span className="text-sm text-slate-700">Adds professional photography terms</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" className="mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        <span className="text-sm text-slate-700">Optimizes for AI model understanding</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" className="mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        <span className="text-sm text-slate-700">Ensures consistent quality output</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path></svg>
                            <span>Powered by Qwen LLM</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "3. Generate Content",
            content: (
                <div>
                    <p className="text-slate-600 text-base md:text-lg font-normal mb-8 leading-relaxed">
                        Alibaba Cloud's Wan2.1 creates stunning visuals in seconds with industry-leading quality.
                    </p>
                    <div className="glass-card rounded-none p-8 border border-slate-200 bg-white/60 shadow-lg">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-none bg-gradient-to-br from-[#0446ff] to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0446ff]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-slate-900 font-bold text-lg mb-2">AI-Powered Generation</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    State-of-the-art text-to-image and text-to-video generation with Alibaba Cloud's Model Studio.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-blue-50 rounded-none p-3 border border-blue-100">
                                        <div className="text-2xl font-bold text-blue-600 mb-1">1024×1024</div>
                                        <div className="text-xs text-slate-600">High Resolution</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-none p-3 border border-blue-100">
                                        <div className="text-2xl font-bold text-blue-600 mb-1">5-10s</div>
                                        <div className="text-xs text-slate-600">Generation Time</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            <span>Alibaba Cloud Wan2.1 Model</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "4. Review & Optimize",
            content: (
                <div>
                    <p className="text-slate-600 text-base md:text-lg font-normal mb-8 leading-relaxed">
                        Preview, analyze, and optimize your content before distribution with AI-powered insights.
                    </p>
                    <div className="glass-card rounded-none p-8 border border-slate-200 bg-white/60 shadow-lg">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-none bg-gradient-to-br from-[#0446ff] to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0446ff]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-slate-900 font-bold text-lg mb-2">Smart Asset Review</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    Real-time preview with quality checks, format validation, and platform-specific optimization.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-none">
                                        <span className="text-sm text-slate-700">Quality Score</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="w-[85%] h-full bg-green-500"></div>
                                            </div>
                                            <span className="text-sm font-semibold text-green-600">85%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-none">
                                        <span className="text-sm text-slate-700">Format Check</span>
                                        <span className="text-sm font-semibold text-green-600">✓ Passed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            <span>AI-powered quality analysis</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "5. Publish Everywhere",
            content: (
                <div>
                    <p className="text-slate-600 text-base md:text-lg font-normal mb-8 leading-relaxed">
                        Automatically distribute to all your social platforms with one click. Schedule or post immediately.
                    </p>
                    <div className="glass-card rounded-none p-8 border border-slate-200 bg-white/60 shadow-lg">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-none bg-gradient-to-br from-[#0446ff] to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0446ff]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line></svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-slate-900 font-bold text-lg mb-2">Multi-Platform Distribution</h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    Post to Twitter/X, Instagram, TikTok, YouTube, and Facebook simultaneously via Composio integration.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                                        <span className="text-xs font-medium text-slate-700">Twitter/X</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E4405F" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                                        <span className="text-xs font-medium text-slate-700">Instagram</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF0050" stroke-width="2"><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path><path d="M17.7 7.7a2.5 2.5 0 1 1 -3.4 3.4a2.5 2.5 0 0 1 3.4 -3.4"></path></svg>
                                        <span className="text-xs font-medium text-slate-700">TikTok</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-none border border-green-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span className="text-sm font-medium text-green-700">Auto-formatted for each platform</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>Powered by Composio • Schedule or post instantly</span>
                        </div>
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
