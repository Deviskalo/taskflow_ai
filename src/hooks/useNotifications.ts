import { useState, useEffect } from 'react';
import { Task } from '../types/Task';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  taskId?: string;
  persistent?: boolean; // New field to mark persistent notifications
}

export const useNotifications = (tasks: Task[]) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);

  // Load persistent notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('taskflow_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        const validNotifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(validNotifications);
      } catch (error) {
        console.error('Error loading saved notifications:', error);
        localStorage.removeItem('taskflow_notifications');
      }
    }
  }, []);

  // Save persistent notifications to localStorage whenever they change
  useEffect(() => {
    const persistentNotifications = notifications.filter(n => n.persistent);
    if (persistentNotifications.length > 0) {
      localStorage.setItem('taskflow_notifications', JSON.stringify(persistentNotifications));
    } else {
      localStorage.removeItem('taskflow_notifications');
    }
  }, [notifications]);

  // Check for browser notification support and permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Check due dates when tasks change
  useEffect(() => {
    checkDueDates(tasks);
  }, [tasks]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      setShowNotificationBanner(false);
      
      if (permission === 'granted') {
        addNotification({
          title: 'Notifications Enabled',
          message: 'You will now receive alerts for due dates and overdue tasks',
          type: 'success',
          persistent: false // This one can auto-disappear
        });
      }
    }
  };

  const dismissNotificationBanner = () => {
    setShowNotificationBanner(false);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'> & { persistent?: boolean }) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      persistent: notification.persistent !== false // Default to persistent unless explicitly set to false
    };
    
    // Check if we already have a similar notification for this task
    const existingNotification = notifications.find(n => 
      n.taskId === newNotification.taskId && 
      n.type === newNotification.type &&
      n.title === newNotification.title
    );

    if (existingNotification) {
      // Update existing notification instead of creating duplicate
      setNotifications(prev => prev.map(n => 
        n.id === existingNotification.id 
          ? { ...newNotification, id: existingNotification.id }
          : n
      ));
    } else {
      // Add new notification
      setNotifications(prev => [newNotification, ...prev]);
    }
    
    // Show browser notification if enabled
    if (notificationsEnabled && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/vite.svg',
        tag: notification.taskId || 'general'
      });
    }
    
    // Only auto-remove non-persistent notifications
    if (!newNotification.persistent) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('taskflow_notifications');
  };

  const checkDueDates = (tasks: Task[]) => {
    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'completed') return;

      // Create the full due date/time
      let dueDateTime: Date;
      if (task.due_time) {
        // Combine date and time
        const dateStr = task.due_date.split('T')[0]; // Get just the date part
        dueDateTime = new Date(`${dateStr}T${task.due_time}`);
      } else {
        dueDateTime = new Date(task.due_date);
      }

      const timeDiff = dueDateTime.getTime() - now.getTime();
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      // Create a unique key for this notification check (daily basis for persistent notifications)
      const notificationKey = `${task.id}-${Math.floor(now.getTime() / (1000 * 60 * 60 * 24))}`; // Check daily
      const lastNotified = localStorage.getItem(`notification_${notificationKey}`);
      
      // For persistent notifications, only check once per day per task
      if (lastNotified) {
        const lastNotifiedDate = new Date(lastNotified);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastNotifiedDate.setHours(0, 0, 0, 0);
        
        if (lastNotifiedDate.getTime() === today.getTime()) {
          return; // Already notified today
        }
      }

      let shouldNotify = false;
      let notificationData: Omit<Notification, 'id' | 'timestamp'> & { persistent?: boolean } | null = null;

      if (timeDiff < 0) {
        // Overdue
        const hoursOverdue = Math.abs(hoursDiff);
        const daysOverdue = Math.abs(daysDiff);
        
        if (daysOverdue > 0) {
          notificationData = {
            title: 'Task Overdue',
            message: `"${task.title}" was due ${daysOverdue} day(s) ago`,
            type: 'error',
            taskId: task.id,
            persistent: true
          };
        } else if (hoursOverdue > 0) {
          notificationData = {
            title: 'Task Overdue',
            message: `"${task.title}" was due ${hoursOverdue} hour(s) ago`,
            type: 'error',
            taskId: task.id,
            persistent: true
          };
        } else {
          notificationData = {
            title: 'Task Overdue',
            message: `"${task.title}" is now overdue`,
            type: 'error',
            taskId: task.id,
            persistent: true
          };
        }
        shouldNotify = true;
      } else if (hoursDiff <= 1 && hoursDiff >= 0) {
        // Due within 1 hour
        notificationData = {
          title: 'Task Due Soon',
          message: `"${task.title}" is due in ${Math.max(1, hoursDiff)} hour(s)`,
          type: 'warning',
          taskId: task.id,
          persistent: true
        };
        shouldNotify = true;
      } else if (daysDiff === 0) {
        // Due today
        notificationData = {
          title: 'Task Due Today',
          message: `"${task.title}" is due today at ${task.due_time || dueDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
          type: 'warning',
          taskId: task.id,
          persistent: true
        };
        shouldNotify = true;
      } else if (daysDiff === 1) {
        // Due tomorrow
        notificationData = {
          title: 'Task Due Tomorrow',
          message: `"${task.title}" is due tomorrow at ${task.due_time || dueDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
          type: 'info',
          taskId: task.id,
          persistent: true
        };
        shouldNotify = true;
      }

      if (shouldNotify && notificationData) {
        addNotification(notificationData);
        localStorage.setItem(`notification_${notificationKey}`, now.toISOString());
      }
    });
  };

  // Clean up notifications for completed tasks
  useEffect(() => {
    const completedTaskIds = tasks.filter(t => t.status === 'completed').map(t => t.id);
    if (completedTaskIds.length > 0) {
      setNotifications(prev => prev.filter(n => !n.taskId || !completedTaskIds.includes(n.taskId)));
    }
  }, [tasks]);

  // Force check notifications when component mounts
  useEffect(() => {
    if (tasks.length > 0) {
      // Small delay to ensure component is mounted
      setTimeout(() => {
        checkDueDates(tasks);
      }, 1000);
    }
  }, []);

  return {
    notifications,
    notificationsEnabled,
    showNotificationBanner,
    addNotification,
    removeNotification,
    clearAllNotifications,
    requestPermission,
    dismissNotificationBanner,
    checkDueDates
  };
};