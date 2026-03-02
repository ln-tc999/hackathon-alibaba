import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Workflow } from '@vlowgen/shared';

interface VlowGenDB extends DBSchema {
  workflows: {
    key: string;
    value: {
      id: string;
      userId: string;
      name: string;
      nodes: Workflow['nodes'];
      edges: Workflow['edges'];
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-user': string; 'by-updated': number };
  };
  users: {
    key: string;
    value: {
      id: string;
      createdAt: number;
      lastActive: number;
    };
  };
  chatSessions: {
    key: string;
    value: {
      id: string;
      userId: string;
      title: string;
      messages: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: number;
      }>;
      workflowId?: string;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-user': string; 'by-updated': number };
  };
  executions: {
    key: string;
    value: {
      id: string;
      workflowId: string;
      userId: string;
      status: 'running' | 'success' | 'failed';
      startedAt: number;
      completedAt?: number;
      duration?: number;
      results?: any;
      errors?: any;
    };
    indexes: { 'by-workflow': string; 'by-user': string };
  };
  rateLimits: {
    key: string;
    value: {
      userId: string;
      action: string;
      count: number;
      resetAt: number;
    };
    indexes: { 'by-user-action': [string, string] };
  };
}

let dbInstance: IDBPDatabase<VlowGenDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<VlowGenDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<VlowGenDB>('vlowgen-db', 1, {
    upgrade(db) {
      // Workflows store
      const workflowStore = db.createObjectStore('workflows', { keyPath: 'id' });
      workflowStore.createIndex('by-user', 'userId');
      workflowStore.createIndex('by-updated', 'updatedAt');

      // Users store
      db.createObjectStore('users', { keyPath: 'id' });

      // Chat sessions store
      const chatSessionStore = db.createObjectStore('chatSessions', { keyPath: 'id' });
      chatSessionStore.createIndex('by-user', 'userId');
      chatSessionStore.createIndex('by-updated', 'updatedAt');

      // Executions store
      const executionStore = db.createObjectStore('executions', { keyPath: 'id' });
      executionStore.createIndex('by-workflow', 'workflowId');
      executionStore.createIndex('by-user', 'userId');

      // Rate limits store
      const rateLimitStore = db.createObjectStore('rateLimits', { keyPath: ['userId', 'action'] });
      rateLimitStore.createIndex('by-user-action', ['userId', 'action']);
    },
  });

  return dbInstance;
}

// User operations
export async function getOrCreateUser(userId: string) {
  const db = await getDB();
  let user = await db.get('users', userId);

  if (!user) {
    user = {
      id: userId,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    await db.put('users', user);
  } else {
    user.lastActive = Date.now();
    await db.put('users', user);
  }

  return user;
}

// Workflow operations
export async function saveWorkflow(workflow: Workflow, userId: string) {
  const db = await getDB();
  const now = Date.now();

  const existing = await db.get('workflows', workflow.id);

  const record = {
    id: workflow.id,
    userId,
    name: workflow.name,
    nodes: workflow.nodes,
    edges: workflow.edges,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await db.put('workflows', record);
  return record;
}

export async function getWorkflow(id: string) {
  const db = await getDB();
  return await db.get('workflows', id);
}

export async function getUserWorkflows(userId: string) {
  const db = await getDB();
  const index = db.transaction('workflows').store.index('by-user');
  return await index.getAll(userId);
}

export async function deleteWorkflow(id: string) {
  const db = await getDB();
  await db.delete('workflows', id);
}

// Execution operations
export async function startExecution(workflowId: string, userId: string) {
  const db = await getDB();
  const execution = {
    id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    workflowId,
    userId,
    status: 'running' as const,
    startedAt: Date.now(),
  };

  await db.put('executions', execution);
  return execution;
}

export async function completeExecution(
  id: string,
  status: 'success' | 'failed',
  results?: any,
  errors?: any
) {
  const db = await getDB();
  const execution = await db.get('executions', id);

  if (execution) {
    execution.status = status;
    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;
    execution.results = results;
    execution.errors = errors;

    await db.put('executions', execution);
  }
}

export async function getWorkflowExecutions(workflowId: string, limit = 50) {
  const db = await getDB();
  const index = db.transaction('executions').store.index('by-workflow');
  const all = await index.getAll(workflowId);
  return all.slice(0, limit);
}

// Rate limiting operations
export async function checkRateLimit(
  userId: string,
  action: string,
  maxCount: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const db = await getDB();
  const now = Date.now();
  const key = `${userId}_${action}`;

  let limit = await db.get('rateLimits', key as any);

  if (!limit || limit.resetAt < now) {
    limit = {
      userId,
      action,
      count: 0,
      resetAt: now + windowMs,
    };
  }

  if (limit.count >= maxCount) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: limit.resetAt,
    };
  }

  limit.count++;
  await db.put('rateLimits', limit);

  return {
    allowed: true,
    remaining: maxCount - limit.count,
    resetAt: limit.resetAt,
  };
}

export async function cleanupExpiredRateLimits() {
  const db = await getDB();
  const now = Date.now();
  const tx = db.transaction('rateLimits', 'readwrite');
  const store = tx.store;
  const all = await store.getAll();

  for (const limit of all) {
    if (limit.resetAt < now) {
      await store.delete([limit.userId, limit.action] as any);
    }
  }

  await tx.done;
}

// Chat session operations
export async function saveChatSession(
  id: string,
  userId: string,
  title: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>,
  workflowId?: string
) {
  const db = await getDB();
  const now = Date.now();

  const existing = await db.get('chatSessions', id);

  const session = {
    id,
    userId,
    title,
    messages,
    workflowId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await db.put('chatSessions', session);
  return session;
}

export async function getChatSession(id: string) {
  const db = await getDB();
  return await db.get('chatSessions', id);
}

export async function getUserChatSessions(userId: string) {
  const db = await getDB();
  const index = db.transaction('chatSessions').store.index('by-user');
  const sessions = await index.getAll(userId);
  return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteChatSession(id: string) {
  const db = await getDB();
  await db.delete('chatSessions', id);
}
