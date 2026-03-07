
import { memo, useCallback } from 'react';
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
  const handleConnect = useCallback(async () => {
    try {
      const response = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'facebook',
          userId: 'default-user',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to connect Facebook: ${error.error || 'Unknown error'}`);
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
          'Facebook OAuth',
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
                `/api/composio/status?userId=default-user&platform=facebook`
              );
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                
                if (statusData.connected) {
                  alert('Facebook connected successfully!');
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
      alert('Failed to connect Facebook. Please try again.');
    }
  }, []);
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
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConnect();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            type="button"
            className="nodrag nopan w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
          >
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
