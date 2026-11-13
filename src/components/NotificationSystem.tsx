import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle, Info, MessageSquare, Briefcase, CreditCard } from 'lucide-react';
import { useAuth } from '../App';
import { getNotifications, markAsRead, markAllNotificationsRead, type Notification } from '../lib/store';

export default function NotificationSystem() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = useCallback(() => {
    if (user) {
      setNotifications(getNotifications(user.uid));
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    window.addEventListener('cg_store_update', loadNotifications);
    return () => window.removeEventListener('cg_store_update', loadNotifications);
  }, [loadNotifications]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllRead = () => {
    if (user) {
      markAllNotificationsRead(user.uid);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'posting': return <Briefcase className="w-4 h-4 text-primary" />;
      case 'application': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'hiring': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'transaction': return <CreditCard className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-ink/40" />;
    }
  };

  const getTitle = (type: Notification['type']) => {
    switch (type) {
      case 'posting': return 'Job Posting';
      case 'application': return 'New Application';
      case 'hiring': return 'Hiring Update';
      case 'transaction': return 'Payment Success';
      default: return 'Notification';
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-bg border border-line rounded-xl text-ink/60 hover:text-primary transition-all shadow-sm"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface transform translate-x-1/4 -translate-y-1/4">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-85 bg-surface/80 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[9999] overflow-hidden"
            >
              <div className="p-4 border-b border-line flex justify-between items-center bg-primary/5">
                <h3 className="font-serif italic font-bold text-ink">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-muted hover:text-ink">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto bg-transparent">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center opacity-30">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-ink" />
                    <p className="text-xs font-serif italic text-ink">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`p-4 border-b border-line/30 last:border-0 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(notif.type)}</div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${!notif.read ? 'text-ink' : 'text-ink/70'}`}>
                            {getTitle(notif.type)}
                          </p>
                          <p className="text-[11px] text-ink/60 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[9px] text-muted mt-2 uppercase font-bold tracking-widest">
                            {new Date(notif.date).toLocaleString()}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 bg-primary/5 border-t border-line text-center">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
