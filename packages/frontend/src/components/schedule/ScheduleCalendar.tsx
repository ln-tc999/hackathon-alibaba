import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Image,
  Video,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Trash2,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Play,
  Square,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import type { ScheduledPost } from './types';
import AddPostModal from './AddPostModal';
import { startScheduler, stopScheduler, getSchedulerStatus } from '@/lib/scheduler-api';
import { toast } from 'sonner';

interface ScheduleCalendarProps {
  scheduledPosts: ScheduledPost[];
  onAddPost: (post: Omit<ScheduledPost, 'id'>) => void;
  onEditPost: (id: string, post: Partial<ScheduledPost>) => void;
  onDeletePost: (id: string) => void;
  schedulerStatus?: { running: boolean; totalPosts: number; pendingPosts: number } | null;
  onSchedulerStatusChange?: (status: { running: boolean; totalPosts: number; pendingPosts: number } | null) => void;
  onBackToChat?: () => void;
}

export default function ScheduleCalendar({
  scheduledPosts,
  onAddPost,
  onEditPost,
  onDeletePost,
  schedulerStatus,
  onSchedulerStatusChange,
  onBackToChat,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'posted' | 'failed'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [showDateSidebar, setShowDateSidebar] = useState(false);

  const PRIMARY_COLOR = '#0446ff';
  const PRIMARY_GRADIENT = 'from-[#0446ff] to-[#0341e0]';

  // Auto-refresh scheduler status every 30 seconds
  useEffect(() => {
    const refreshStatus = async () => {
      try {
        const status = await getSchedulerStatus();
        onSchedulerStatusChange?.(status);
      } catch (error) {
        console.error('Failed to refresh scheduler status:', error);
      }
    };

    refreshStatus();
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, [onSchedulerStatusChange]);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  const getPostsForDate = useCallback((date: Date | null) => {
    if (!date) return [];

    let posts = scheduledPosts.filter((post) => {
      const postDate = new Date(post.scheduledTime);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });

    if (filterStatus !== 'all') {
      posts = posts.filter(post => post.status === filterStatus);
    }

    return posts.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }, [scheduledPosts, filterStatus]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getPlatformConfig = (platform: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string; label: string }> = {
      twitter: {
        icon: Twitter,
        color: 'text-sky-500',
        bg: 'bg-sky-50',
        label: 'Twitter',
      },
      instagram: {
        icon: Instagram,
        color: 'text-pink-500',
        bg: 'bg-pink-50',
        label: 'Instagram',
      },
      facebook: {
        icon: Facebook,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        label: 'Facebook',
      },
      youtube: {
        icon: Youtube,
        color: 'text-red-500',
        bg: 'bg-red-50',
        label: 'YouTube',
      },
    };
    return configs[platform] || { icon: Calendar, color: 'text-gray-500', bg: 'bg-gray-50', label: platform };
  };

  const getStatusConfig = (status: ScheduledPost['status']) => {
    const configs: Record<string, { color: string; bg: string; icon: any; label: string }> = {
      pending: {
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        icon: Clock,
        label: 'Scheduled',
      },
      posted: {
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        icon: CheckCircle2,
        label: 'Posted',
      },
      failed: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        icon: AlertCircle,
        label: 'Failed',
      },
    };
    return configs[status] || configs.pending;
  };

  const handleAddPost = (post: Omit<ScheduledPost, 'id'>) => {
    onAddPost(post);
    setShowAddModal(false);
    toast.success('Post scheduled successfully!');
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleUpdatePost = (updated: Omit<ScheduledPost, 'id'>) => {
    if (editingPost) {
      onEditPost(editingPost.id, updated);
      setEditingPost(null);
      setShowEditModal(false);
      toast.success('Post updated successfully!');
    }
  };

  const handleDeletePost = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (!confirm('Delete this scheduled post? This action cannot be undone.')) {
      return;
    }
    
    onDeletePost(id);
    setSelectedPost(null);
    toast.success('Post deleted successfully');
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDateSidebar(true);
  };

  const handleStartScheduler = async () => {
    try {
      await startScheduler();
      toast.success('Scheduler started');
      onSchedulerStatusChange?.(await getSchedulerStatus());
    } catch (error) {
      toast.error('Failed to start scheduler');
    }
  };

  const handleStopScheduler = async () => {
    try {
      await stopScheduler();
      toast.success('Scheduler stopped');
      onSchedulerStatusChange?.(await getSchedulerStatus());
    } catch (error) {
      toast.error('Failed to stop scheduler');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const status = await getSchedulerStatus();
      onSchedulerStatusChange?.(status);
      toast.success('Status refreshed');
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredPosts = filterStatus === 'all' 
    ? scheduledPosts 
    : scheduledPosts.filter(post => post.status === filterStatus);

  const upcomingPosts = filteredPosts
    .filter(post => new Date(post.scheduledTime) > new Date())
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 5);

  const stats = {
    total: filteredPosts.length,
    pending: filteredPosts.filter(p => p.status === 'pending').length,
    posted: filteredPosts.filter(p => p.status === 'posted').length,
    failed: filteredPosts.filter(p => p.status === 'failed').length,
  };

  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {/* Top Bar */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0341e0 100%)`,
                  boxShadow: `0 4px 14px ${PRIMARY_COLOR}40`,
                }}
              >
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Content Scheduler</h2>
                <p className="text-xs text-gray-500">Plan and automate your posts</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Back to Chat Button */}
            {onBackToChat && (
              <button
                onClick={onBackToChat}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Back to Chat
              </button>
            )}

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                List
              </button>
            </div>

            {/* Scheduler Controls */}
            {schedulerStatus?.running ? (
              <button
                onClick={handleStopScheduler}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleStartScheduler}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0341e0 100%)`,
                boxShadow: `0 4px 14px ${PRIMARY_COLOR}40`,
              }}
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 flex items-center gap-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
          
          <div className="w-px h-8 bg-gray-200" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-amber-600">{stats.pending}</div>
              <div className="text-xs text-gray-500">Scheduled</div>
            </div>
          </div>
          
          <div className="w-px h-8 bg-gray-200" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600">{stats.posted}</div>
              <div className="text-xs text-gray-500">Posted</div>
            </div>
          </div>
          
          <div className="w-px h-8 bg-gray-200" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-300 transition-colors focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': `${PRIMARY_COLOR}30` } as any}
          >
            <option value="all">All Posts</option>
            <option value="pending">Scheduled</option>
            <option value="posted">Posted</option>
            <option value="failed">Failed</option>
          </select>

          {/* Navigation */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900 min-w-[180px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
              style={{
                color: PRIMARY_COLOR,
                backgroundColor: `${PRIMARY_COLOR}10`,
              }}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'month' ? (
        /* Month View */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 p-3 text-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</span>
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="bg-white min-h-[120px]" />;
              }

              const postsForDate = getPostsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`bg-white min-h-[120px] p-2 cursor-pointer transition-all hover:bg-gray-50 ${
                    isToday ? 'bg-blue-50/50' : ''
                  } ${isSelected ? 'ring-2 ring-inset' : ''}`}
                  style={isSelected ? { '--tw-ring-color': PRIMARY_COLOR } as any : {}}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'text-white shadow-md'
                        : 'text-gray-700'
                    }`}
                    style={isToday ? {
                      background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0341e0 100%)`,
                      boxShadow: `0 2px 8px ${PRIMARY_COLOR}40`,
                    } : {}}
                    >
                      {date.getDate()}
                    </span>
                    {postsForDate.length > 0 && (
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {postsForDate.length} post{postsForDate.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {postsForDate.slice(0, 3).map((post) => {
                      const platformConfig = getPlatformConfig(post.platform);
                      const statusConfig = getStatusConfig(post.status);
                      const PlatformIcon = platformConfig.icon;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={post.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                          className="group p-1.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-md ${platformConfig.bg} flex items-center justify-center flex-shrink-0`}>
                              <PlatformIcon className={`w-3 h-3 ${platformConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-gray-600 truncate">
                                {post.content.slice(0, 25)}...
                              </p>
                            </div>
                            <StatusIcon className={`w-3 h-3 flex-shrink-0 ${statusConfig.color}`} />
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5">
                            {new Date(post.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}
                    {postsForDate.length > 3 && (
                      <div className="text-[10px] text-gray-500 text-center py-1 bg-gray-50 rounded-lg">
                        +{postsForDate.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Posts */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                Upcoming Posts
              </h3>
              
              {upcomingPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-900">No upcoming posts</p>
                  <p className="text-xs text-gray-500 mt-1">Schedule your first post to get started</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0341e0 100%)`,
                      boxShadow: `0 4px 14px ${PRIMARY_COLOR}40`,
                    }}
                  >
                    Schedule Post
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingPosts.map((post) => {
                    const platformConfig = getPlatformConfig(post.platform);
                    const statusConfig = getStatusConfig(post.status);
                    const PlatformIcon = platformConfig.icon;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${platformConfig.bg} flex items-center justify-center flex-shrink-0 shadow`}>
                            <PlatformIcon className={`w-6 h-6 ${platformConfig.color}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(post.scheduledTime).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id, e as any); }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                Overview
              </h3>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Scheduler Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${schedulerStatus?.running ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-sm font-medium text-gray-900">
                      {schedulerStatus?.running ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">Posts by Platform</div>
                  <div className="space-y-2">
                    {['twitter', 'instagram', 'facebook', 'youtube'].map((platform) => {
                      const count = scheduledPosts.filter(p => p.platform === platform).length;
                      const config = getPlatformConfig(platform);
                      const PlatformIcon = config.icon;
                      
                      return (
                        <div key={platform} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PlatformIcon className={`w-4 h-4 ${config.color}`} />
                            <span className="text-sm text-gray-600">{config.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">Success Rate</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${stats.total > 0 ? (stats.posted / stats.total) * 100 : 0}%`,
                          background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0341e0 100%)`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.total > 0 ? Math.round((stats.posted / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Sidebar - Shows when date is clicked */}
      {showDateSidebar && selectedDate && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
          {/* Sidebar Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedDatePosts.length} post{selectedDatePosts.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            <button
              onClick={() => setShowDateSidebar(false)}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Posts List */}
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {selectedDatePosts.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-900">No posts scheduled</p>
                <p className="text-xs text-gray-500 mt-1">Click "New Post" to schedule one</p>
                <button
                  onClick={() => {
                    setShowDateSidebar(false);
                    setShowAddModal(true);
                  }}
                  className="mt-4 px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0341e0 100%)`,
                    boxShadow: `0 4px 14px ${PRIMARY_COLOR}40`,
                  }}
                >
                  Schedule Post
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDatePosts.map((post) => {
                  const platformConfig = getPlatformConfig(post.platform);
                  const statusConfig = getStatusConfig(post.status);
                  const PlatformIcon = platformConfig.icon;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={post.id}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${platformConfig.bg} flex items-center justify-center flex-shrink-0`}>
                          <PlatformIcon className={`w-5 h-5 ${platformConfig.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(post.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <button
                  onClick={() => {
                    setShowDateSidebar(false);
                    setShowAddModal(true);
                  }}
                  className="w-full p-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Post for This Day
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay for sidebar */}
      {showDateSidebar && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setShowDateSidebar(false)}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${getPlatformConfig(selectedPost.platform).bg} flex items-center justify-center shadow`}>
                  {(() => {
                    const PlatformIcon = getPlatformConfig(selectedPost.platform).icon;
                    return <PlatformIcon className={`w-5 h-5 ${getPlatformConfig(selectedPost.platform).color}`} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Post Details</h3>
                  <p className="text-xs text-gray-500">{getPlatformConfig(selectedPost.platform).label}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {selectedPost.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled</label>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(selectedPost.scheduledTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{new Date(selectedPost.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    {(() => {
                      const statusConfig = getStatusConfig(selectedPost.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {selectedPost.mediaUrl && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Media</label>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                    {selectedPost.mediaType === 'video' ? (
                      <Video className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Image className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="capitalize">{selectedPost.mediaType}</span>
                    <a
                      href={selectedPost.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:underline text-xs"
                    >
                      View Media →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => { handleEditPost(selectedPost); setSelectedPost(null); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={(e) => { handleDeletePost(selectedPost.id, e as any); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddPostModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPost}
        />
      )}

      {showEditModal && editingPost && (
        <AddPostModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingPost(null); }}
          onAdd={handleUpdatePost}
          initialData={editingPost}
        />
      )}
    </div>
  );
}
