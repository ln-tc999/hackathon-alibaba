import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import type { ScheduledPost } from './types';
import AddPostModal from './AddPostModal';

interface ScheduleCalendarProps {
  scheduledPosts: ScheduledPost[];
  onAddPost: (post: Omit<ScheduledPost, 'id'>) => void;
  onEditPost: (id: string, post: Partial<ScheduledPost>) => void;
  onDeletePost: (id: string) => void;
}

export default function ScheduleCalendar({
  scheduledPosts,
  onAddPost,
  onDeletePost,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  // Get posts for a specific date
  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];

    return scheduledPosts.filter((post) => {
      const postDate = new Date(post.scheduledTime);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Platform icon helper
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-3.5 h-3.5" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5" />;
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'bg-blue-500 text-white';
      case 'instagram':
        return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white';
      case 'facebook':
        return 'bg-indigo-600 text-white';
      case 'youtube':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const totalPosts = scheduledPosts.length;
  const pendingPosts = scheduledPosts.filter((p) => p.status === 'pending').length;

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 sm:gap-5 lg:gap-6 overflow-hidden">
      {/* Main Calendar */}
      <div className="flex-1 flex flex-col bg-white rounded-none border border-gray-200 shadow-sm overflow-hidden min-h-0">
        {/* Header */}
        <div className="px-4 sm:px-5 lg:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-none bg-[#0446ff] flex items-center justify-center shadow-lg shadow-[#0446ff]/25 flex-shrink-0">
                <img src="/logo.svg" alt="VlowGen" className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 font-sans">
                  Content Calendar
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {totalPosts} posts • {pendingPosts} pending
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-[#0446ff] text-white rounded-none hover:bg-[#0335cc] transition-all font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#0446ff]/25 hover:shadow-xl hover:shadow-[#0446ff]/30 hover:scale-105"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Post</span>
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <button
                onClick={previousMonth}
                className="p-2 sm:p-2.5 hover:bg-white/60 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>

              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 font-sans min-w-[160px] sm:min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>

              <button
                onClick={nextMonth}
                className="p-2 sm:p-2.5 hover:bg-white/60 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[#0446ff] hover:bg-white/60 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3 mb-2 sm:mb-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 py-2 sm:py-2.5 uppercase tracking-wide"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3">
            {calendarDays.map((date, index) => {
              const posts = getPostsForDate(date);
              const isToday =
                date &&
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();
              const isSelected =
                selectedDate &&
                date &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

              return (
                <div
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] p-2 sm:p-2.5 md:p-3 rounded-none border-2 transition-all cursor-pointer ${
                    date
                      ? isSelected
                        ? 'border-[#0446ff] bg-blue-50 shadow-md'
                        : isToday
                          ? 'border-[#0446ff]/50 bg-blue-50/50 hover:border-[#0446ff]'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  {date && (
                    <>
                      <div
                        className={`text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 flex items-center justify-between font-sans ${
                          isToday ? 'text-[#0446ff]' : 'text-gray-700'
                        }`}
                      >
                        <span>{date.getDate()}</span>
                        {posts.length > 0 && (
                          <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-[#0446ff] text-white rounded-none font-semibold">
                            {posts.length}
                          </span>
                        )}
                      </div>

                      {/* Posts for this day */}
                      <div className="space-y-1 sm:space-y-1.5">
                        {posts.slice(0, 2).map((post) => (
                          <div
                            key={post.id}
                            className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-none text-[9px] sm:text-[10px] font-medium ${getPlatformColor(post.platform)} shadow-sm`}
                          >
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="hidden sm:inline">
                                {getPlatformIcon(post.platform)}
                              </span>
                              <span className="truncate flex-1">
                                {post.content.substring(0, 15)}...
                              </span>
                            </div>
                          </div>
                        ))}
                        {posts.length > 2 && (
                          <div className="text-[9px] sm:text-[10px] text-gray-600 font-semibold text-center py-0.5 sm:py-1">
                            +{posts.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Selected Date Details */}
      {selectedDate && (
        <div className="w-full lg:w-96 xl:w-[420px] flex flex-col bg-white rounded-none border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 font-sans">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 sm:p-2 hover:bg-white/60 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              {getPostsForDate(selectedDate).length} post(s) scheduled
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="space-y-2.5 sm:space-y-3">
              {getPostsForDate(selectedDate).map((post) => (
                <div
                  key={post.id}
                  className="p-3 sm:p-4 bg-gray-50 rounded-none border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-none text-[10px] sm:text-xs font-semibold ${getPlatformColor(post.platform)} shadow-sm flex items-center gap-1 sm:gap-1.5`}
                    >
                      {getPlatformIcon(post.platform)}
                      <span className="capitalize">{post.platform}</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => {
                          /* TODO: Edit modal */
                        }}
                        className="p-1 sm:p-1.5 text-gray-500 hover:text-[#0446ff] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="p-1 sm:p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="font-medium text-[10px] sm:text-xs">
                      {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 line-clamp-3 font-sans">
                    {post.content}
                  </p>

                  {post.mediaUrl && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 bg-white px-2 py-1 sm:py-1.5 rounded-none border border-gray-200">
                      {post.mediaType === 'video' ? (
                        <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      ) : (
                        <Image className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      )}
                      <span className="font-medium">Media attached</span>
                    </div>
                  )}
                </div>
              ))}

              {getPostsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0446ff] rounded-none flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg shadow-[#0446ff]/25">
                    <img src="/logo.svg" alt="VlowGen" className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 font-sans">
                    No posts scheduled for this day
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0446ff] text-white rounded-none hover:bg-[#0335cc] transition-colors text-xs sm:text-sm font-medium"
                  >
                    Schedule a Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Post Modal */}
      <AddPostModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddPost}
      />
    </div>
  );
}
