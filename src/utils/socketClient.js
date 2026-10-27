import { io } from 'socket.io-client';

const isMock = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_USE_MOCK !== 'false' : true;

class MockSocket {
  constructor() {
    this.listeners = {};
    this.connected = true;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.listeners[event]) return this;
    if (!callback) {
      delete this.listeners[event];
    } else {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    return this;
  }

  emit(event, data) {
    // If client or therapist sends a message, simulate typing and reply
    if (event === 'send_message') {
      // Trigger instant sent confirmation
      setTimeout(() => {
        this.trigger('message_status', { messageId: data.id, status: 'delivered' });
      }, 400);

      setTimeout(() => {
        this.trigger('message_status', { messageId: data.id, status: 'read' });
      }, 1000);

      // Simulate typing indicator from other party after 1.2s
      setTimeout(() => {
        this.trigger('typing_start', { senderId: data.recipientId, senderName: 'Therapy Practice' });
      }, 1400);

      // Simulate response after 2.4s
      setTimeout(() => {
        this.trigger('typing_stop', { senderId: data.recipientId });
        
        const replies = [
          "Thank you for sharing that. Let's make sure we discuss this in detail during our next scheduled session.",
          "I have noted this in your journal. Please practice the 4-7-8 breathing technique we walked through if anxiety spikes.",
          "Good evening! I saw your update. I'm glad the sleep routine adjustment is beginning to feel more manageable.",
          "Understood. If you need to review our reschedule guidelines or access your session notes, they are available in your portal anytime."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const replyMessage = {
          id: 'msg_' + Date.now(),
          conversationId: data.conversationId,
          senderId: data.recipientId,
          recipientId: data.senderId,
          text: randomReply,
          createdAt: new Date().toISOString(),
          status: 'delivered'
        };

        this.trigger('receive_message', replyMessage);
      }, 2600);
    }
    return this;
  }

  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error('MockSocket listener error', err);
        }
      });
    }
  }

  disconnect() {
    this.listeners = {};
    this.connected = false;
  }
}

let socketInstance = null;

export function getSocket() {
  if (isMock) {
    if (!socketInstance) {
      socketInstance = new MockSocket();
    }
    return socketInstance;
  }

  if (!socketInstance) {
    const token = localStorage.getItem('unfazed_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const socketUrl = baseUrl.replace('/api', '');
    socketInstance = io(socketUrl, {
      auth: { token },
      autoConnect: true
    });
  }
  return socketInstance;
}
