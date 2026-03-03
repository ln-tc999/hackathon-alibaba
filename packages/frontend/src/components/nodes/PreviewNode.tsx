import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Eye } from 'lucide-react';

interface PreviewNodeProps {
  data: {
    type: 'preview';
  };
  selected?: boolean;
}

/**
 * Preview Node - Shows generated media before posting
 */
function PreviewNode({ selected }: PreviewNodeProps) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border-2 min-w-[280px]
        ${selected ? 'border-emerald-500' : 'border-emerald-200'}
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-emerald-500 border-2 border-white"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-t-lg flex items-center gap-2">
        <Eye className="w-5 h-5" />
        <span className="font-semibold">Preview Media</span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm text-gray-600">
          Preview generated image or video before posting to social media
        </p>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-emerald-500 border-2 border-white"
      />
    </div>
  );
}

export default memo(PreviewNode);
