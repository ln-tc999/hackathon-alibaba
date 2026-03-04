import { useState, useMemo } from 'react';
import { Calendar, Clock, Image, Video, Twitter, Instagram, Facebook, Youtube, Trash2, Plus, Edit2, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
        
        return scheduledPosts.filter(post => {
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
            case 'twitter': return <Twitter className="w-3.5 h-3.5" />;
            case 'instagram': return <Instagram className="w-3.5 h-3.5" />;
            case 'facebook': return <Facebook className="w-3.5 h-3.5" />;
            case 'youtube': return <Youtube className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'twitter': return 'bg-blue-500 text-white';
            case 'instagram': return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white';
            case 'facebook': return 'bg-indigo-600 text-white';
            case 'youtube': return 'bg-red-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const totalPosts = scheduledPosts.length;
    const pendingPosts = scheduledPosts.filter(p => p.status === 'pending').length;

    return (
        <div className="flex flex-col lg:flex-row h-full gap-4">
            {/* Main Calendar */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-0">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                <Calendar className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Content Calendar</h2>
                                <p className="text-sm text-gray-600">{totalPosts} posts scheduled • {pendingPosts} pending</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Post</span>
                        </button>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={previousMonth}
                                className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            
                            <h3 className="text-lg font-bold text-gray-900 min-w-[180px] text-center">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                                aria-label="Next month"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                        
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-white/60 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 p-4 overflow-auto">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-wide">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((date, index) => {
                            const posts = getPostsForDate(date);
                            const isToday = date && 
                                date.getDate() === new Date().getDate() &&
                                date.getMonth() === new Date().getMonth() &&
                                date.getFullYear() === new Date().getFullYear();
                            const isSelected = selectedDate && date &&
                                date.getDate() === selectedDate.getDate() &&
                                date.getMonth() === selectedDate.getMonth() &&
                                date.getFullYear() === selectedDate.getFullYear();
                            
                            return (
                                <div
                                    key={index}
                                    onClick={() => date && setSelectedDate(date)}
                                    className={`min-h-[120px] p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                        date
                                            ? isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : isToday
                                                    ? 'border-blue-300 bg-blue-50/50 hover:border-blue-400'
                                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                                            : 'bg-transparent border-transparent'
                                    }`}
                                >
                                    {date && (
                                        <>
                                            <div className={`text-sm font-bold mb-2 flex items-center justify-between ${
                                                isToday ? 'text-blue-600' : 'text-gray-700'
                                            }`}>
                                                <span>{date.getDate()}</span>
                                                {posts.length > 0 && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-500 text-white rounded-full font-semibold">
                                                        {posts.length}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Posts for this day */}
                                            <div className="space-y-1.5">
                                                {posts.slice(0, 3).map(post => (
                                                    <div
                                                        key={post.id}
                                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-medium ${getPlatformColor(post.platform)} shadow-sm`}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            {getPlatformIcon(post.platform)}
                                                            <span className="truncate flex-1">{post.content.substring(0, 20)}...</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {posts.length > 3 && (
                                                    <div className="text-[10px] text-gray-600 font-semibold text-center py-1">
                                                        +{posts.length - 3} more
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
                <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:max-h-full">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-gray-900">
                                {selectedDate.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </h4>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600">
                            {getPostsForDate(selectedDate).length} post(s) scheduled
                        </p>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-4">
                        <div className="space-y-3">
                            {getPostsForDate(selectedDate).map(post => (
                                <div
                                    key={post.id}
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getPlatformColor(post.platform)} shadow-sm flex items-center gap-1.5`}>
                                            {getPlatformIcon(post.platform)}
                                            <span className="capitalize">{post.platform}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {/* TODO: Edit modal */}}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDeletePost(post.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-medium">
                                            {new Date(post.scheduledTime).toLocaleTimeString('en-US', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">{post.content}</p>
                                    
                                    {post.mediaUrl && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-2 py-1.5 rounded-lg border border-gray-200">
                                            {post.mediaType === 'video' ? (
                                                <Video className="w-3.5 h-3.5" />
                                            ) : (
                                                <Image className="w-3.5 h-3.5" />
                                            )}
                                            <span className="font-medium">Media attached</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {getPostsForDate(selectedDate).length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Calendar className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">No posts scheduled for this day</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
