import { Link } from 'react-router-dom';
import { HiBell, HiX } from 'react-icons/hi';
import { useUserNotifications } from '../context/UserNotificationsContext';
import { useEffect, useState } from 'react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  } = useUserNotifications();

  useEffect(() => {
    if (!isOpen) return;

    // Fetch latest notifications and unread count when dropdown opens
    fetchNotifications(0).catch((err) => console.error('Failed to fetch notifications:', err));
    fetchUnreadCount().catch((err) => console.error('Failed to fetch unread count:', err));
  }, [isOpen, fetchNotifications, fetchUnreadCount]);

  const topNotifications = notifications.slice(0, 5);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (err) {
      return 'Recently';
    }
  };

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(notificationId);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

  return (
    <div className="relative group">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center relative transition-colors hover:text-yellow-400"
      >
        <HiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-2xl border border-gray-200 z-[100] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-black text-sm">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-black hover:text-gray-700 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {topNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {topNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      notification.isRead
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold text-gray-900 truncate ${
                          !notification.isRead ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              View All Notifications →
            </Link>
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
