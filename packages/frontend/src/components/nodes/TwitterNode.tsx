'use client';

import { useCallback } from 'react';
import { NodeProps } from 'reactflow';
import type { TwitterNodeData } from '@vlowgen/shared';
import BaseNode from './BaseNode';

/**
 * Twitter Node component for social media posting
 * Requirements: 5.3, 5.6, 15.1, 15.2
 */
export default function TwitterNode({ data, selected }: NodeProps<TwitterNodeData & { error?: string }>) {
  const handleConnectTwitter = useCallback(() => {
    // TODO: Implement OAuth flow when backend integration is ready
    // This will open a popup or redirect to Composio OAuth flow
    console.log('Connect Twitter clicked');
    // For now, this is a placeholder that will be implemented in future tasks
  }, []);

  const executionError = (data as any).error;

  return (
    <BaseNode
      selected={selected}
      error={executionError}
      icon="🐦"
      title="Twitter Post"
    >
      <div className="space-y-3">
        {/* Authentication status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Status:</span>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              data.authenticated
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {data.authenticated ? '✓ Connected' : '○ Disconnected'}
          </span>
        </div>

        {/* Connected account handle */}
        {data.authenticated && data.accountHandle && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-xs text-gray-600">Connected as:</div>
            <div className="text-sm font-medium text-blue-700">
              @{data.accountHandle}
            </div>
          </div>
        )}

        {/* Connect button */}
        {!data.authenticated && (
          <button
            onClick={handleConnectTwitter}
            className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Connect Twitter
          </button>
        )}

        {/* Disconnect option when connected */}
        {data.authenticated && (
          <button
            onClick={handleConnectTwitter}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Reconnect
          </button>
        )}

        {/* Info text */}
        <p className="text-xs text-gray-500">
          {data.authenticated
            ? 'This node will post content to your Twitter account.'
            : 'Connect your Twitter account to enable posting.'}
        </p>
      </div>
    </BaseNode>
  );
}
