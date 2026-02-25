'use client';

import { X, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import type { ExecutionResult, NodeExecutionResult } from '@vlowgen/shared';

interface ExecutionPanelProps {
  execution?: ExecutionResult;
  onClose: () => void;
}

/**
 * ExecutionPanel displays workflow execution progress and results
 * Shows current executing node, final results, and Twitter URL
 * Validates: Requirements 7.3, 10.3, 12.4
 */
export default function ExecutionPanel({ execution, onClose }: ExecutionPanelProps) {
  if (!execution) return null;

  const { status, nodeResults, error, workflowId } = execution;

  // Find currently executing node (if any)
  const currentNode = Object.values(nodeResults).find(
    (result) => result.status === 'success' && !result.endTime
  );

  // Get Twitter URL from Twitter node result
  const twitterUrl = Object.values(nodeResults).find(
    (result) => result.nodeId.includes('twitter') && result.output?.tweetUrl
  )?.output?.tweetUrl;

  // Calculate execution progress
  const totalNodes = Object.keys(nodeResults).length;
  const completedNodes = Object.values(nodeResults).filter(
    (result) => result.status === 'success' || result.status === 'error'
  ).length;
  const progressPercentage = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {status === 'running' && (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {status === 'error' && (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <h3 className="font-semibold text-gray-900">
            {status === 'running' && 'Executing Workflow'}
            {status === 'success' && 'Execution Complete'}
            {status === 'error' && 'Execution Failed'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close execution panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Progress bar */}
        {status === 'running' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Current executing node */}
        {status === 'running' && currentNode && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-blue-900">
                Executing: {formatNodeId(currentNode.nodeId)}
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && error && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-900 mb-1">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Node results */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Node Results</h4>
          {Object.values(nodeResults).map((result) => (
            <NodeResultItem key={result.nodeId} result={result} />
          ))}
        </div>

        {/* Twitter URL (final result) */}
        {status === 'success' && twitterUrl && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-900 mb-2">
              Posted to Twitter
            </p>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View Tweet</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual node result display component
 */
function NodeResultItem({ result }: { result: NodeExecutionResult }) {
  const { nodeId, status, error, duration } = result;

  return (
    <div className="flex items-start gap-2 p-2 rounded border border-gray-200">
      <div className="mt-0.5">
        {status === 'success' && (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
        {status === 'error' && (
          <XCircle className="w-4 h-4 text-red-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {formatNodeId(nodeId)}
        </p>
        {status === 'error' && error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        {status === 'success' && duration && (
          <p className="text-xs text-gray-500 mt-1">
            Completed in {(duration / 1000).toFixed(2)}s
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Format node ID for display (remove prefix, capitalize)
 */
function formatNodeId(nodeId: string): string {
  // Extract node type from ID if possible
  if (nodeId.includes('prompt')) return 'Prompt Text';
  if (nodeId.includes('wan2')) return 'Image Generation';
  if (nodeId.includes('twitter')) return 'Twitter Post';
  return nodeId;
}
