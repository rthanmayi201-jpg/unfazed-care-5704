const NOTIFICATIONS_STORAGE_KEY = 'unfazed_notifications_log';

class NotificationBus {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(event) {
    const notification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: event.title || 'Notification',
      message: event.message,
      type: event.type || 'info', // booking, payment, reminder, waitlist, system
      channel: event.channel || 'in_app', // in_app, whatsapp, email
      recipient: event.recipient || 'Dr. Sharma',
      status: event.status || 'delivered', // delivered, sent, queued
      timestamp: new Date().toISOString(),
      read: false,
      ...event
    };

    // Store in localStorage for notification log history
    try {
      const existing = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
      existing.unshift(notification);
      // Keep up to 100 entries
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
    } catch (e) {
      console.error('Failed to save notification', e);
    }

    this.subscribers.forEach(cb => {
      try {
        cb(notification);
      } catch (err) {
        console.error('Error in notification subscriber', err);
      }
    });

    return notification;
  }

  getHistory() {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }

    // Default sample events if empty
    const seed = [
      {
        id: 'notif_1',
        title: 'New Session Booked',
        message: 'Aarav Mehta booked a 60 min CBT Session for tomorrow at 11:00 AM IST.',
        type: 'booking',
        channel: 'whatsapp',
        recipient: '+91 98765 43210 (Client & Therapist)',
        status: 'delivered',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        read: false
      },
      {
        id: 'notif_2',
        title: 'Payment Confirmed',
        message: 'Received ₹2,500 via UPI (pay_rzp_demo_882) for Session #S-1049.',
        type: 'payment',
        channel: 'email',
        recipient: 'sharma@demo.com',
        status: 'delivered',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        read: true
      },
      {
        id: 'notif_3',
        title: '24hr Automated Reminder',
        message: 'Sent appointment reminder with Google Meet link to Priya Nair for Thursday at 4:00 PM.',
        type: 'reminder',
        channel: 'whatsapp',
        recipient: '+91 98200 11223',
        status: 'delivered',
        timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
        read: true
      },
      {
        id: 'notif_4',
        title: 'Waitlist Alert Triggered',
        message: 'Cancellation for Friday 5 PM freed up a slot. Notified waitlisted client Dev Patel.',
        type: 'waitlist',
        channel: 'whatsapp',
        recipient: '+91 98330 44556',
        status: 'sent',
        timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
        read: true
      }
    ];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  markAllAsRead() {
    const list = this.getHistory().map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    return list;
  }

  clearAll() {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  }
}

export const notificationService = new NotificationBus();
