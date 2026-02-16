import React from 'react'
import { useUIStore } from '../store/authStore'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

/**
 * Notification Component - عرض إشعار واحد
 */
const Notification = ({ notification, onRemove }) => {
  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  }

  const bgColorMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }

  const textColorMap = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${
        bgColorMap[notification.type] || bgColorMap.info
      } animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <div className="flex-shrink-0">
        {iconMap[notification.type] || iconMap.info}
      </div>
      
      <div className="flex-1">
        {notification.title && (
          <h3 className={`font-semibold ${textColorMap[notification.type]}`}>
            {notification.title}
          </h3>
        )}
        <p className={textColorMap[notification.type]}>
          {notification.message}
        </p>
      </div>

      <button
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

/**
 * NotificationCenter - عرض جميع الإشعارات
 */
export const NotificationCenter = () => {
  const notifications = useUIStore((state) => state.notifications)
  const removeNotification = useUIStore((state) => state.removeNotification)

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}

/**
 * Hook للاستخدام السهل في أي مكان
 * 
 * مثال:
 * const notify = useNotification()
 * notify.success('تم بنجاح!')
 * notify.error('حدث خطأ!')
 */
export const useNotification = () => {
  const addNotification = useUIStore((state) => state.addNotification)

  return {
    success: (message, title = 'نجح') =>
      addNotification({
        type: 'success',
        title,
        message,
        duration: 3000,
      }),
    error: (message, title = 'خطأ') =>
      addNotification({
        type: 'error',
        title,
        message,
        duration: 5000,
      }),
    info: (message, title = 'معلومة') =>
      addNotification({
        type: 'info',
        title,
        message,
        duration: 3000,
      }),
    warning: (message, title = 'تحذير') =>
      addNotification({
        type: 'warning',
        title,
        message,
        duration: 4000,
      }),
  }
}

export default NotificationCenter