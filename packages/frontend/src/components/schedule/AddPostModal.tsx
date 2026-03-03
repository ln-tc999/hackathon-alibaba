import { useState } from 'react';
import { X, Calendar, Clock, Image, Video, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';
import type { ScheduledPost } from './types';

interface AddPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (post: Omit<ScheduledPost, 'id'>) => void;
}

export default function AddPostModal({ isOpen, onClose, onAdd }: AddPostModalProps) {
    const [content, setContent] = useState('');
    const [platform, setPlatform] = useState<ScheduledPost['platform']>('twitter');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!content || !scheduledDate || !scheduledTime) {
            alert('Please fill in all required fields');
            return;
        }

        const scheduledTimeISO = `${scheduledDate}T${scheduledTime}:00`;
        
        onAdd({
            content,
            platform,
            scheduledTime: scheduledTimeISO,
            mediaUrl: mediaUrl || undefined,
            mediaType: mediaUrl ? mediaType : undefined,
            status: 'pending',
        });

        // Reset form
        setContent('');
        setPlatform('twitter');
        setScheduledDate('');
        setScheduledTime('');
        setMediaUrl('');
        setMediaType('image');
        
        onClose();
    };

    const platforms = [
        { value: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'blue' },
        { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink' },
        { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'indigo' },
        { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' },
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto m-4">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Schedule New Post</h3>
                            <p className="text-xs text-gray-500">Plan your content ahead</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Platform Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Select Platform
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {platforms.map(({ value, label, icon: Icon, color }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setPlatform(value)}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        platform === value
                                            ? `border-${color}-500 bg-${color}-50`
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${
                                            platform === value ? `text-${color}-600` : 'text-gray-400'
                                        }`} />
                                        <span className={`font-medium ${
                                            platform === value ? `text-${color}-700` : 'text-gray-700'
                                        }`}>
                                            {label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Post Content *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What do you want to share?"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {content.length} characters
                        </p>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Time *
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media URL (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Media URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        
                        {mediaUrl && (
                            <div className="mt-3 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMediaType('image')}
                                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                                        mediaType === 'image'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <Image className="w-4 h-4 mx-auto mb-1" />
                                    <span className="text-xs font-medium">Image</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMediaType('video')}
                                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                                        mediaType === 'video'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <Video className="w-4 h-4 mx-auto mb-1" />
                                    <span className="text-xs font-medium">Video</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            Schedule Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
