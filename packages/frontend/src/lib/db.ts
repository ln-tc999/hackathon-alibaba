import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
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
  mediaHistory: {
    key: string;
    value: {
      id: string;
      userId: string;
      minioUrl: string;
      mediaType: 'image' | 'video';
      prompt: string;
      sessionId?: string;
      workflowId?: string;
      platform?: string;
      createdAt: number;
      size?: number;
      dimensions?: { width: number; height: number };
    };
    indexes: { 'by-user': string; 'by-session': string; 'by-type': string; 'by-created': number };
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

  dbInstance = await openDB<VlowGenDB>('vlowgen-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const workflowStore = db.createObjectStore('workflows', { keyPath: 'id' });
        workflowStore.createIndex('by-user', 'userId');
        workflowStore.createIndex('by-updated', 'updatedAt');

        db.createObjectStore('users', { keyPath: 'id' });

        const chatSessionStore = db.createObjectStore('chatSessions', { keyPath: 'id' });
        chatSessionStore.createIndex('by-user', 'userId');
        chatSessionStore.createIndex('by-updated', 'updatedAt');

        const executionStore = db.createObjectStore('executions', { keyPath: 'id' });
        executionStore.createIndex('by-workflow', 'workflowId');
        executionStore.createIndex('by-user', 'userId');

        const rateLimitStore = db.createObjectStore('rateLimits', { keyPath: ['userId', 'action'] });
        rateLimitStore.createIndex('by-user-action', ['userId', 'action']);
      }

      if (oldVersion < 2) {
        const mediaHistoryStore = db.createObjectStore('mediaHistory', { keyPath: 'id' });
        mediaHistoryStore.createIndex('by-user', 'userId');
        mediaHistoryStore.createIndex('by-session', 'sessionId');
        mediaHistoryStore.createIndex('by-type', 'mediaType');
        mediaHistoryStore.createIndex('by-created', 'createdAt');
      }
    },
  });

  return dbInstance;
}

export async function getOrCreateUser(userId: string) {
  const db = await getDB();
  let user = await db.get('users', userId);

  if (!user) {
    user = { id: userId, createdAt: Date.now(), lastActive: Date.now() };
    await db.put('users', user);
  } else {
    user.lastActive = Date.now();
    await db.put('users', user);
  }

  return user;
}

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

export async function createChatSession(
  userId: string,
  title: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>,
  workflowId?: string
): Promise<string> {
  const db = await getDB();
  const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const session = {
    id,
    userId,
    title,
    messages,
    workflowId,
    createdAt: now,
    updatedAt: now,
  };

  await db.put('chatSessions', session);
  return id;
}

export interface MediaHistory {
  id: string;
  userId: string;
  minioUrl: string;
  mediaType: 'image' | 'video';
  prompt: string;
  sessionId?: string;
  workflowId?: string;
  platform?: string;
  createdAt: number;
  size?: number;
  dimensions?: { width: number; height: number };
}

export async function saveMediaHistory(media: Omit<MediaHistory, 'id' | 'userId'>): Promise<string> {
  const db = await getDB();
  const userId = getUserId();
  const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const mediaRecord: MediaHistory = {
    id,
    userId,
    createdAt: now,
    ...media,
  };

  await db.put('mediaHistory', mediaRecord);
  return id;
}

export async function getUserMediaHistory(
  userId: string,
  filter?: {
    mediaType?: 'image' | 'video';
    sessionId?: string;
    limit?: number;
  }
): Promise<MediaHistory[]> {
  const db = await getDB();
  const index = db.transaction('mediaHistory').store.index('by-user');
  const all = await index.getAll(userId);

  let filtered = all;

  if (filter?.mediaType) {
    filtered = filtered.filter(m => m.mediaType === filter.mediaType);
  }

  if (filter?.sessionId) {
    filtered = filtered.filter(m => m.sessionId === filter.sessionId);
  }

  filtered.sort((a, b) => b.createdAt - a.createdAt);

  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit);
  }

  return filtered;
}

export async function getMediaHistoryById(id: string): Promise<MediaHistory | undefined> {
  const db = await getDB();
  return await db.get('mediaHistory', id);
}

export async function deleteMediaHistory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('mediaHistory', id);
}

export async function getMediaStats(userId: string): Promise<{
  total: number;
  images: number;
  videos: number;
}> {
  const db = await getDB();
  const index = db.transaction('mediaHistory').store.index('by-user');
  const all = await index.getAll(userId);

  return {
    total: all.length,
    images: all.filter(m => m.mediaType === 'image').length,
    videos: all.filter(m => m.mediaType === 'video').length,
  };
}

export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'anonymous';
  }
  let userId = localStorage.getItem('vlowgen_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('vlowgen_user_id', userId);
  }
  return userId;
}

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
