
import { memo, useCallback } from 'react';
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
  const handleConnect = useCallback(async () => {
    try {
      const response = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'tiktok',
          userId: 'default-user',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to connect TikTok: ${error.error || 'Unknown error'}`);
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
          'TikTok OAuth',
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
                `/api/composio/status?userId=default-user&platform=tiktok`
              );
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                
                if (statusData.connected) {
                  alert('TikTok connected successfully!');
                  // window.location.reload(); // Disabled - user should stay in workflow view
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
      alert('Failed to connect TikTok. Please try again.');
    }
  }, []);
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
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConnect();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            type="button"
            className="nodrag nopan w-full px-3 py-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all cursor-pointer"
          >
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
