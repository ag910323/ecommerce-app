import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as notificationsApi from '../api/notificationsApi';
import type { UserNotification, NotificationsResponse } from '../api/notificationsApi';

interface UserNotificationsContextType {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  error: string | null;
}

const UserNotificationsContext = createContext<UserNotificationsContextType | undefined>(undefined);

export const useUserNotifications = () => {
  const context = useContext(UserNotificationsContext);
  if (!context) {
    throw new Error('useUserNotifications must be used within a UserNotificationsProvider');
  }
  return context;
};

export const UserNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications for a specific page
  const fetchNotifications = useCallback(
    async (page: number = 0) => {
      if (!user?.id) {
        setNotifications([]);
        setTotalPages(0);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response: NotificationsResponse = await notificationsApi.getNotifications(
          user.id,
          page,
          10
        );
        
        if (page === 0) {
          // Replace for first page
          setNotifications(response.content || []);
        } else {
          // Append for pagination
          setNotifications(prev => [...prev, ...(response.content || [])]);
        }
        
        setCurrentPage(page);
        setTotalPages(response.totalPages || 0);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError((err as Error).message || 'Failed to fetch notifications');
        // Don't crash the app, just set empty state
        if (page === 0) {
          setNotifications([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationsApi.getUnreadCount(user.id);
      setUnreadCount(Math.max(0, count));
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      // Don't crash, just leave unread count as is
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.markNotificationAsRead(notificationId);
      
      // Update local state instantly
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (currentPage < totalPages - 1 && !isLoading) {
      await fetchNotifications(currentPage + 1);
    }
  }, [currentPage, totalPages, isLoading, fetchNotifications]);

  // Refresh notifications (reset to first page)
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(0);
    await fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial load when user is available
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(0);
      fetchUnreadCount();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setCurrentPage(0);
      setTotalPages(0);
    }
  }, [user?.id]);

  // Periodic refresh (every 30 seconds)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, fetchUnreadCount]);

  const hasMore = currentPage < totalPages - 1;

  return (
    <UserNotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        currentPage,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        loadMore,
        refreshNotifications,
        error,
      }}
    >
      {children}
    </UserNotificationsContext.Provider>
  );
};
