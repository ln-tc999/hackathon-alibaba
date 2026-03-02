import type { Workflow } from '@vlowgen/shared';
import { 
  saveWorkflow as saveWorkflowToIndexedDB, 
  getWorkflow, 
  getUserWorkflows, 
  deleteWorkflow as deleteWorkflowFromIndexedDB,
  startExecution,
  completeExecution as completeExecutionInIndexedDB,
  getWorkflowExecutions
} from './db';
import { getUserId } from './user';

export async function saveWorkflow(workflow: Workflow): Promise<void> {
  const userId = getUserId();
  await saveWorkflowToIndexedDB(workflow, userId);
}

export async function updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<void> {
  const userId = getUserId();
  const existing = await getWorkflow(id);
  
  if (existing) {
    const updated: Workflow = {
      id: existing.id,
      name: workflow.name || existing.name,
      nodes: workflow.nodes || existing.nodes,
      edges: workflow.edges || existing.edges,
    };
    await saveWorkflowToIndexedDB(updated, userId);
  }
}

export async function loadWorkflow(id: string): Promise<Workflow> {
  const record = await getWorkflow(id);
  
  if (!record) {
    throw new Error('Workflow not found');
  }

  return {
    id: record.id,
    name: record.name,
    nodes: record.nodes,
    edges: record.edges,
  };
}

export async function loadUserWorkflows(): Promise<Workflow[]> {
  const userId = getUserId();
  const records = await getUserWorkflows(userId);

  return records.map((record) => ({
    id: record.id,
    name: record.name,
    nodes: record.nodes,
    edges: record.edges,
  }));
}

export async function deleteWorkflow(id: string): Promise<void> {
  await deleteWorkflowFromIndexedDB(id);
}

export async function logExecutionStart(workflowId: string): Promise<string> {
  const userId = getUserId();
  const execution = await startExecution(workflowId, userId);
  return execution.id;
}

export async function logExecutionComplete(
  executionId: string,
  status: 'success' | 'failed',
  results?: any,
  errors?: any
): Promise<void> {
  await completeExecutionInIndexedDB(executionId, status, results, errors);
}

export async function loadExecutionHistory(workflowId: string, limit = 50): Promise<any[]> {
  const executions = await getWorkflowExecutions(workflowId, limit);
  
  return executions.map((exec) => ({
    id: exec.id,
    workflowId: exec.workflowId,
    status: exec.status,
    startedAt: exec.startedAt,
    completedAt: exec.completedAt,
    duration: exec.duration,
    results: exec.results,
    errors: exec.errors,
  }));
}
