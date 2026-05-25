import api from './axios';

export interface UserNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  read?: boolean;
  createdAt: string;
  updatedAt?: string;
  type?: string;
}

export interface RawUserNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
  type?: string;
}

export interface NotificationsResponse {
  content: UserNotification[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  count: number;
}

const normalizeNotification = (notification: RawUserNotification): UserNotification => ({
  ...notification,
  isRead: notification.read ?? notification.isRead ?? false,
});

// Get notifications with pagination (latest first)
export const getNotifications = async (
  userId: number,
  page: number = 0,
  size: number = 10
): Promise<NotificationsResponse> => {
  try {
    if (!userId) {
      return {
        content: [],
        empty: true,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 0,
        pageable: {
          offset: 0,
          pageNumber: 0,
          pageSize: size,
          paged: true,
          unpaged: false,
        },
        size: 0,
        totalElements: 0,
        totalPages: 0,
      };
    }

    const response = await api.get(`/api/notifications/${userId}`, {
      params: {
        page,
        size,
        sort: 'createdAt,desc', // Latest first
      },
    });
    
    const payload = response.data?.data ?? response.data;
    const body = payload && typeof payload === 'object' ? payload : {};

    return {
      content: Array.isArray((body as any).content)
        ? (body as any).content.map(normalizeNotification)
        : [],
      empty: (body as any).empty ?? true,
      first: (body as any).first ?? true,
      last: (body as any).last ?? true,
      number: (body as any).number ?? page,
      numberOfElements: (body as any).numberOfElements ?? 0,
      pageable: (body as any).pageable || {
        offset: page * size,
        pageNumber: page,
        pageSize: size,
        paged: true,
        unpaged: false,
      },
      size: (body as any).size ?? 0,
      totalElements: (body as any).totalElements ?? 0,
      totalPages: (body as any).totalPages ?? 0,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async (userId: number): Promise<number> => {
  try {
    if (!userId) return 0;

    const response = await api.get(`/api/notifications/${userId}/unread-count`);
    const payload = response.data?.data ?? response.data;
    
    if (typeof payload === 'number') return Math.max(0, payload);
    if (payload && typeof payload === 'object') {
      if ((payload as any).count !== undefined) return Math.max(0, (payload as any).count);
      if ((payload as any).data !== undefined) return Math.max(0, (payload as any).data);
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<UserNotification> => {
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    const payload = response.data?.data ?? response.data;
    const body = payload && typeof payload === 'object' ? payload : {};
    return normalizeNotification(body as RawUserNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read (optional)
export const markAllNotificationsAsRead = async (userId: number): Promise<void> => {
  try {
    await api.put(`/api/notifications/${userId}/read-all`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification (optional)
export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await api.delete(`/api/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
