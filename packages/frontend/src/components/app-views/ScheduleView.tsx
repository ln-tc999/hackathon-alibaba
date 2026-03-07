import { memo, Suspense, lazy, useState, useCallback } from 'react';
import type { ScheduledPost } from '@/components/schedule/types';
import type { SchedulerStatus } from '@/lib/scheduler-api';
import { MessageSquare } from 'lucide-react';

// Lazy load heavy component
const ScheduleCalendar = lazy(() => import('@/components/schedule/ScheduleCalendar'));

// Loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

interface ScheduleViewProps {
  scheduledPosts: ScheduledPost[];
  schedulerStatus: SchedulerStatus | null;
  onAddPost: (post: Omit<ScheduledPost, 'id'>) => void;
  onEditPost: (id: string, updates: Partial<ScheduledPost>) => void;
  onDeletePost: (id: string) => void;
  onBackToChat?: () => void;
}

const ScheduleView = memo(function ScheduleView({
  scheduledPosts,
  schedulerStatus,
  onAddPost,
  onEditPost,
  onDeletePost,
  onBackToChat,
}: ScheduleViewProps) {
  const [localSchedulerStatus, setLocalSchedulerStatus] = useState<SchedulerStatus | null>(schedulerStatus);

  // Merge local status with prop status
  const status = localSchedulerStatus || schedulerStatus;

  const handleSchedulerStatusChange = useCallback((newStatus: SchedulerStatus | null) => {
    setLocalSchedulerStatus(newStatus);
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden px-2 sm:px-4 lg:px-6 pt-2 sm:pt-3 lg:pt-4 pb-4 gap-2 sm:gap-3 lg:gap-4">
      <div className="flex-1 min-h-0">
        <Suspense fallback={<LoadingSpinner />}>
          <ScheduleCalendar
            scheduledPosts={scheduledPosts}
            onAddPost={onAddPost}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            schedulerStatus={status}
            onSchedulerStatusChange={handleSchedulerStatusChange}
            onBackToChat={onBackToChat}
          />
        </Suspense>
      </div>
    </div>
  );
});

export default ScheduleView;
