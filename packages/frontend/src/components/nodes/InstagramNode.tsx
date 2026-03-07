
import { memo, useCallback } from 'react';
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
  const handleConnect = useCallback(async () => {
    try {
      // Call API to initiate OAuth flow
      const response = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'instagram',
          userId: 'default-user',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to connect Instagram: ${error.error || 'Unknown error'}`);
        return;
      }

      const responseData = await response.json();

      // Open OAuth popup
      if (responseData.redirectUrl) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          responseData.redirectUrl,
          'Instagram OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          alert('Popup blocked! Please allow popups for this site.');
          return;
        }

        // Poll for popup close and check connection status
        const pollInterval = setInterval(async () => {
          if (popup.closed) {
            clearInterval(pollInterval);

            // Check if connection was successful
            try {
              const statusResponse = await fetch(
                `/api/composio/status?userId=default-user&platform=instagram`
              );

              if (statusResponse.ok) {
                const statusData = await statusResponse.json();

                if (statusData.connected) {
                  alert('Instagram connected successfully!');
                  // window.location.reload(); // Disabled - user should stay in workflow view
                }
              }
            } catch (error) {
              // Silent fail
            }
          }
        }, 1000);

        // Clear interval after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      } else {
        alert('No redirect URL received from server');
      }
    } catch (error) {
      alert('Failed to connect Instagram. Please try again.');
    }
  }, []);

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
            className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700"
          >
            Connected (Test Mode)
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
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button physically clicked!');
              handleConnect();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            type="button"
            className="nodrag nopan w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer"
          >
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
