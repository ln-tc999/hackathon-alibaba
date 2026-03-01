'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNode from './BaseNode';
import { Music } from 'lucide-react';
import type { TikTokNodeData } from '@vlowgen/shared';

interface TikTokNodeProps {
  id: string;
  data: TikTokNodeData;
  selected?: boolean;
}

function TikTokNode({ id, data, selected }: TikTokNodeProps) {
  return (
    <BaseNode
      id={id}
      title="TikTok Post"
      icon={Music}
      selected={selected}
      color="black"
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

        {data.authenticated && data.accountHandle && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Account
            </label>
            <div className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg">
              <span className="text-sm text-white">@{data.accountHandle}</span>
            </div>
          </div>
        )}

        {!data.authenticated && (
          <button className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all">
            Connect TikTok
          </button>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
          <p className="font-medium text-gray-700 mb-1">TikTok Posting:</p>
          <p>Posts short-form videos to your TikTok account with captions and hashtags.</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
}

export default memo(TikTokNode);
