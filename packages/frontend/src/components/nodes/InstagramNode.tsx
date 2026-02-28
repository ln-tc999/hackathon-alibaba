'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNode from './BaseNode';
import { Instagram } from 'lucide-react';
import type { InstagramNodeData } from '@vlowgen/shared';

interface InstagramNodeProps {
  id: string;
  data: InstagramNodeData;
  selected?: boolean;
}

function InstagramNode({ id, data, selected }: InstagramNodeProps) {
  return (
    <BaseNode
      id={id}
      title="Instagram Post"
      icon={Instagram}
      selected={selected}
      color="pink"
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
            <div className="px-3 py-2 bg-pink-50 border border-pink-200 rounded-lg">
              <span className="text-sm text-pink-700">@{data.accountHandle}</span>
            </div>
          </div>
        )}

        {!data.authenticated && (
          <button className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
            Connect Instagram
          </button>
        )}

        <div className="text-xs text-gray-500 bg-pink-50 p-2 rounded border border-pink-200">
          <p className="font-medium text-pink-700 mb-1">Instagram Posting:</p>
          <p>Posts images and captions to your Instagram account. Supports photos and carousel posts.</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
}

export default memo(InstagramNode);
