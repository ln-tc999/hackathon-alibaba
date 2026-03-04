export interface ScheduledPost {
    id: string;
    content: string;
    platform: 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok';
    scheduledTime: string; // ISO date string
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    status: 'pending' | 'posted' | 'failed';
    workflowId?: string;
}

export interface ScheduleState {
    posts: ScheduledPost[];
    addPost: (post: Omit<ScheduledPost, 'id'>) => void;
    editPost: (id: string, post: Partial<ScheduledPost>) => void;
    deletePost: (id: string) => void;
    getPostsByDate: (date: Date) => ScheduledPost[];
}
