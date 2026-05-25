import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiBell, HiCheckCircle } from 'react-icons/hi';
import Header from './Header';
import { useUserNotifications } from '../context/UserNotificationsContext';

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    hasMore,
    markAsRead,
    loadMore,
    refreshNotifications,
  } = useUserNotifications();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Setup infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore().catch(err => console.error('Error loading more notifications:', err));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(notificationId);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

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

      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (err) {
      return 'Recently';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return date.toLocaleDateString('en-US', options);
    } catch (err) {
      return 'Unknown date';
    }
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce(
    (acc, notification) => {
      try {
        const date = formatDate(notification.createdAt);
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(notification);
      } catch (err) {
        console.error('Error grouping notification:', err);
      }
      return acc;
    },
    {} as Record<string, typeof notifications>
  );

  const handleRefresh = async () => {
    try {
      await refreshNotifications();
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
                <ol className="inline-flex items-center gap-1">
                  <li>
                    <Link to="/" className="hover:text-yellow-500 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                  <li className="text-gray-900 font-semibold">Notifications</li>
                </ol>
              </nav>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <HiBell className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-600 mt-1">Stay updated with your latest alerts and order updates.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back to Shop
              </Link>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {Object.entries(groupedNotifications).length > 0 ? (
            <>
              {Object.entries(groupedNotifications).map(([date, notifs]) => (
                <div key={date} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                  <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                      {date}
                    </h3>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {notifs.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                        className={`cursor-pointer transition duration-200 ${
                          notification.isRead
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`mt-1 flex h-11 w-11 items-center justify-center rounded-full ${notification.isRead ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                              {notification.isRead ? (
                                <HiCheckCircle className="h-5 w-5" />
                              ) : (
                                <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <h3 className={`text-lg ${notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                                    {notification.title}
                                  </h3>
                                  {!notification.isRead && (
                                    <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                      Unread
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-gray-600 line-clamp-3">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div ref={observerTarget} className="py-8 text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                ) : hasMore ? (
                  <p className="text-gray-500 text-sm">Scroll to load more</p>
                ) : (
                  <p className="text-gray-500 text-sm">No more notifications</p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-yellow-600">
                <HiBell className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">You're all caught up!</h3>
              <p className="text-gray-600 max-w-xl mx-auto">
                There are no new notifications right now. Check back later for updates on orders, offers, and account activity.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-medium text-black hover:bg-yellow-500 transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
