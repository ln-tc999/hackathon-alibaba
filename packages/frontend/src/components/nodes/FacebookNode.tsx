'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNode from './BaseNode';
import { Facebook } from 'lucide-react';
import type { FacebookNodeData } from '@vlowgen/shared';

interface FacebookNodeProps {
  id: string;
  data: FacebookNodeData;
  selected?: boolean;
}

function FacebookNode({ id, data, selected }: FacebookNodeProps) {
  return (
    <BaseNode
      id={id}
      title="Facebook Post"
      icon={Facebook}
      selected={selected}
      color="blue"
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
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm text-blue-700">{data.accountHandle}</span>
            </div>
          </div>
        )}

        {!data.authenticated && (
          <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all">
            Connect Facebook
          </button>
        )}

        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
          <p className="font-medium text-blue-700 mb-1">Facebook Posting:</p>
          <p>Posts text, images, and videos to your Facebook page or profile.</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
}

export default memo(FacebookNode);
