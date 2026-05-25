import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamationCircle } from 'react-icons/hi';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { 
      ...notification, 
      id,
      duration: notification.duration || (notification.type === 'success' ? 1500 : 4000),
      autoClose: notification.autoClose !== false
    };
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration (faster for success messages)
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [removeNotification]);

  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification
  }), [notifications, addNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <HiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <HiXCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <HiExclamationCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <HiInformationCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`${getBackgroundColor()} border rounded-lg shadow-md p-3 animate-slide-in pointer-events-auto cursor-pointer transition-all duration-300 hover:shadow-lg`}
         onClick={() => onRemove(notification.id)}>
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words leading-tight">
            {notification.title}
          </p>
          {notification.message && (
            <p className="mt-1 text-xs opacity-80 break-words leading-tight">
              {notification.message}
            </p>
          )}
        </div>
        <button
          className="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(notification.id);
          }}
        >
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
