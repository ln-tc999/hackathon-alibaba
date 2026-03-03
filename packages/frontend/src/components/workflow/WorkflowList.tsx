
import { useEffect, useState } from 'react';
import { loadUserWorkflows, deleteWorkflow } from '@/lib/workflow-api';
import type { Workflow } from '@vlowgen/shared';
import { FileText, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowListProps {
  onSelectWorkflow?: (workflow: Workflow) => void;
}

export default function WorkflowList({ onSelectWorkflow }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await loadUserWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      await deleteWorkflow(id);
      setWorkflows(workflows.filter(w => w.id !== id));
      toast.success('Workflow deleted');
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No saved workflows yet</p>
        <p className="text-xs mt-1">Create a workflow to get started</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Saved Workflows</h3>
      {workflows.map((workflow) => (
        <div
          key={workflow.id}
          onClick={() => onSelectWorkflow?.(workflow)}
          className="group p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {workflow.name}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{workflow.nodes.length} nodes</span>
                <span>•</span>
                <span>{workflow.edges.length} connections</span>
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(workflow.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
              aria-label="Delete workflow"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
