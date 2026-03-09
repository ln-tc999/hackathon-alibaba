
import { useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Twitter } from 'lucide-react';
import type { TwitterNodeData } from '@vlowgen/shared';
import BaseNode from './BaseNode';

/**
 * Twitter Node component for social media posting
 * Requirements: 5.3, 5.6, 15.1, 15.2
 */
export default function TwitterNode({ data, selected }: NodeProps<TwitterNodeData & { error?: string }>) {
  const handleConnectTwitter = useCallback(async () => {
    try {
      // Get actual user ID from localStorage
      const userId = localStorage.getItem('vlowgen_user_id') || `user_${Date.now()}`;

      const response = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'twitter',
          userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to connect Twitter: ${error.error || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      
      if (data.redirectUrl) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.redirectUrl,
          'Twitter OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        if (!popup) {
          alert('Popup blocked! Please allow popups for this site.');
          return;
        }

        const pollInterval = setInterval(async () => {
          if (popup.closed) {
            clearInterval(pollInterval);

            try {
              const statusResponse = await fetch(
                `/api/composio/status?userId=default-user&platform=twitter`
              );

              if (statusResponse.ok) {
                const statusData = await statusResponse.json();

                if (statusData.connected) {
                  alert('Twitter connected successfully! Please refresh the page to use it.');
                  // Don't reload - let user continue working
                  // window.location.reload();
                } else {
                  alert('Connection status unknown. Please try connecting again or refresh the page.');
                }
              }
            } catch (error) {
              // Silent fail
            }
          }
        }, 1000);
        
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error) {
      alert('Failed to connect Twitter. Please try again.');
    }
  }, []);

  const executionError = (data as any).error;

  return (
    <BaseNode
      selected={selected}
      error={executionError}
      icon={Twitter}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConnectTwitter();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            type="button"
            className="nodrag nopan w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          >
            Connect Twitter
          </button>
        )}

        {/* Disconnect option when connected */}
        {data.authenticated && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConnectTwitter();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            type="button"
            className="nodrag nopan w-full px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 cursor-pointer"
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
