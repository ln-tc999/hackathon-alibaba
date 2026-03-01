'use client';

import { useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';
import type { PromptTextNodeData } from '@vlowgen/shared';
import BaseNode from './BaseNode';

/**
 * Prompt Text Node component for text input
 * Requirements: 5.1, 5.4, 15.1, 15.2
 */
export default function PromptTextNode({ data, selected }: NodeProps<PromptTextNodeData & { error?: string }>) {
  const handleTextChange = useCallback(
    (_event: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Note: Node data updates will be handled by React Flow's internal state management
      // The data prop is controlled by the parent WorkflowCanvas component
      // For now, we just update the local textarea value
      // TODO: Implement proper data flow when integrating with workflow execution
    },
    []
  );

  const characterCount = data.promptText.length;
  const hasValidationError = data.promptText.trim().length === 0;
  const executionError = (data as any).error;

  return (
    <BaseNode
      selected={selected}
      error={executionError}
      icon={FileText}
      title="Prompt Text"
    >
      <div className="space-y-2">
        <textarea
          value={data.promptText}
          onChange={handleTextChange}
          placeholder="Enter your prompt text..."
          className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Character count: {characterCount}</span>
          {hasValidationError && !executionError && (
            <span className="text-red-600 font-medium">Text required</span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
