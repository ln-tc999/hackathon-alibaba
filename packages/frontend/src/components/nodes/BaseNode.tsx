'use client';

import { ReactNode, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { AlertCircle } from 'lucide-react';

interface BaseNodeProps {
  id?: string;
  selected: boolean;
  error?: string;
  icon?: string;
  title: string;
  children: ReactNode;
}

/**
 * Base node component with common UI elements
 * Provides handles for connections, selection highlighting, and error state indicators
 * Shows error details in tooltip on hover (Requirement 15.2)
 * Requirements: 4.4, 15.1, 15.2
 */
export default function BaseNode({
  selected,
  error,
  icon,
  title,
  children,
}: BaseNodeProps) {
  const [showErrorTooltip, setShowErrorTooltip] = useState(false);
  const hasError = !!error;

  return (
    <div
      className={`
        min-w-[250px] bg-white rounded-lg shadow-md border-2 transition-all relative
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
        ${hasError ? 'border-red-500 bg-red-50' : ''}
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />

      {/* Node header */}
      <div className={`px-4 py-2 border-b ${hasError ? 'border-red-200 bg-red-100' : 'border-gray-100 bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="font-semibold text-sm">{title}</span>
          {hasError && (
            <div
              className="ml-auto relative"
              onMouseEnter={() => setShowErrorTooltip(true)}
              onMouseLeave={() => setShowErrorTooltip(false)}
            >
              <AlertCircle className="w-4 h-4 text-red-600 cursor-help" />
              
              {/* Error tooltip */}
              {showErrorTooltip && (
                <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50">
                  <div className="font-semibold mb-1">Error Details:</div>
                  <div className="text-gray-200">{error}</div>
                  {/* Arrow */}
                  <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Node content */}
      <div className="px-4 py-3">
        {children}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  );
}
