import { memo } from 'react';
import { MessageSquare, Zap, CalendarDays, Menu } from 'lucide-react';
import type { AppView } from '@/hooks/useViewSync';

interface AppHeaderProps {
  view: AppView;
  onBackToChat?: () => void;
  onBackToLanding?: () => void;
  onScheduleClick?: () => void;
  onToggleMobileHistory?: () => void;
}

const AppHeader = memo(function AppHeader({
  view,
  onBackToChat,
  onBackToLanding,
  onScheduleClick,
  onToggleMobileHistory,
}: AppHeaderProps) {
  return (
    <div className="px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 lg:pt-6 pb-0">
      <div className="flex justify-between items-center px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-none bg-[#0446ff] flex items-center justify-center shadow-lg shadow-[#0446ff]/25">
            <img src="/logo.svg" alt="VlowGen" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-900 font-sans">VlowGen</h1>
            <p className="text-[10px] sm:text-xs text-gray-500">AI Workflow Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          {/* Back to Landing button */}
          {view !== 'landing' && onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg hover:from-gray-100 hover:to-slate-100 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Landing</span>
            </button>
          )}

          {/* Back to Chat button - only show in workflow mode */}
          {view === 'workflow' && onBackToChat && (
            <button
              onClick={onBackToChat}
              className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all"
            >
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Chat</span>
            </button>
          )}

          {/* Mode indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">
              {view === 'chat' ? 'AI' : view === 'workflow' ? 'Build' : 'Schedule'}
            </span>
          </div>

          {/* Schedule button */}
          {onScheduleClick && (
            <button
              onClick={onScheduleClick}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                view === 'schedule'
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
            >
              <CalendarDays
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${view === 'schedule' ? 'text-purple-600' : 'text-gray-600'}`}
              />
              <span
                className={`text-xs font-semibold hidden sm:inline ${view === 'schedule' ? 'text-purple-700' : 'text-gray-700'}`}
              >
                Schedule
              </span>
            </button>
          )}

          {/* Mobile hamburger */}
          {onToggleMobileHistory && (
            <button
              onClick={onToggleMobileHistory}
              className="lg:hidden flex items-center justify-center w-8 h-8 bg-white border border-gray-200 hover:border-[#0446ff] hover:text-[#0446ff] transition-all"
              style={{ borderRadius: '8px' }}
              aria-label="Open chat history"
              title="Chat History"
            >
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default AppHeader;
