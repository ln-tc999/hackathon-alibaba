'use client';

import { memo, useCallback } from 'react';
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
  const handleConnect = useCallback(async () => {
    try {
      const response = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'youtube',
          userId: 'default-user',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to connect YouTube: ${error.error || 'Unknown error'}`);
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
          'YouTube OAuth',
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
                `/api/composio/status?userId=default-user&platform=youtube`
              );
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                
                if (statusData.connected) {
                  alert('YouTube connected successfully!');
                  window.location.reload();
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
      alert('Failed to connect YouTube. Please try again.');
    }
  }, []);
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
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConnect();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            type="button"
            className="nodrag nopan w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all cursor-pointer"
          >
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
