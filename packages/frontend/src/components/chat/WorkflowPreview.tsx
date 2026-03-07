import { memo } from 'react';
import { ArrowRight, CheckCircle2, FileText, Wand2, Video, Eye, Image as ImageIcon, Twitter, Instagram, Facebook, Music, Youtube, Sparkles } from 'lucide-react';
import type { Workflow } from '@vlowgen/shared';
import { getNodeLabel } from '@/lib/chat-constants';

interface WorkflowPreviewProps {
  workflow: Workflow;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'prompt-text': FileText,
  'prompt-enhancer-image': Wand2,
  'prompt-enhancer-video': Video,
  'vision-analyzer': Eye,
  'wan2': ImageIcon,
  'twitter': Twitter,
  'instagram': Instagram,
  'facebook': Facebook,
  'tiktok': Music,
  'youtube': Youtube,
};

const WorkflowPreview = memo(function WorkflowPreview({ workflow }: WorkflowPreviewProps) {
  const nodesToShow = workflow.nodes.slice(0, 4);
  const remainingNodes = workflow.nodes.length - 4;

  const getIcon = (nodeType: string) => {
    const IconComponent = ICON_MAP[nodeType] || Sparkles;
    return <IconComponent className="w-3 h-3" style={{ color: '#0446ff' }} />;
  };

  return (
    <div className="pl-8">
      <div
        className="p-3 border space-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(4,70,255,0.04) 0%, rgba(4,70,255,0.02) 100%)',
          borderColor: 'rgba(4,70,255,0.18)',
          boxShadow: '0 2px 12px rgba(4,70,255,0.06)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 animate-pulse"
            style={{ background: '#0446ff' }}
          />
          <span className="text-[11px] font-semibold" style={{ color: '#0446ff' }}>
            Workflow Updated
          </span>
        </div>

        {/* Node pipeline */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-wrap">
          {nodesToShow.map((node, idx) => {
            const label = getNodeLabel(node.type);
            const Icon = getIcon(node.type);
            return (
              <div key={node.id} className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="px-2 py-1 bg-white border flex items-center gap-1 text-[11px] font-medium text-slate-600"
                  style={{
                    borderColor: 'rgba(4,70,255,0.15)',
                    boxShadow: '0 1px 4px rgba(4,70,255,0.06)',
                  }}
                >
                  {Icon}
                  {label}
                </div>
                {idx < Math.min(3, workflow.nodes.length - 1) && (
                  <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                )}
              </div>
            );
          })}
          {remainingNodes > 0 && (
            <span className="text-[11px] text-slate-400">
              +{remainingNodes} more
            </span>
          )}
        </div>

        {/* Node count */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <CheckCircle2 className="w-3 h-3" style={{ color: '#0446ff' }} />
          <span>{workflow.nodes.length} nodes ready</span>
        </div>
      </div>
    </div>
  );
});

export default WorkflowPreview;
