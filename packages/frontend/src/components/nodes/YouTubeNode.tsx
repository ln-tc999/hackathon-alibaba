'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNode from './BaseNode';
import { Youtube } from 'lucide-react';
import type { YouTubeNodeData } from '@vlowgen/shared';

interface YouTubeNodeProps {
  id: string;
  data: YouTubeNodeData;
  selected?: boolean;
}

function YouTubeNode({ id, data, selected }: YouTubeNodeProps) {
  return (
    <BaseNode
      id={id}
      title="YouTube Upload"
      icon={Youtube}
      selected={selected}
      color="red"
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Status</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              data.authenticated
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {data.authenticated ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {data.authenticated && data.channelName && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Channel
            </label>
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm text-red-700">{data.channelName}</span>
            </div>
          </div>
        )}

        {!data.authenticated && (
          <button className="w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all">
            Connect YouTube
          </button>
        )}

        <div className="text-xs text-gray-500 bg-red-50 p-2 rounded border border-red-200">
          <p className="font-medium text-red-700 mb-1">YouTube Upload:</p>
          <p>Uploads videos to your YouTube channel with title, description, and tags.</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
}

export default memo(YouTubeNode);
