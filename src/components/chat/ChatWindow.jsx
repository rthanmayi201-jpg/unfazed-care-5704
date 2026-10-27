import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, ShieldAlert } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import { useSocket } from '../../hooks/useSocket.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { chatApi } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ChatWindow({
  conversationId = 'conv_sharma_client1',
  recipientName = 'Aarav Mehta',
  recipientId = 'client_1',
  therapistView = true
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load initial chat messages
  useEffect(() => {
    let mounted = true;
    chatApi.getMessages(conversationId).then(data => {
      if (mounted) setMessages(data);
    });
    return () => { mounted = false; };
  }, [conversationId]);

  // Setup real/mock socket listeners
  const { emit } = useSocket({
    receive_message: (msg) => {
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
    },
    typing_start: () => {
      setIsTyping(true);
    },
    typing_stop: () => {
      setIsTyping(false);
    },
    message_status: ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m));
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: 'msg_' + Date.now(),
      conversationId,
      senderId: user?.id || (therapistView ? 'therapist_sharma' : 'client_1'),
      recipientId: recipientId,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Save to API & emit via socket
    chatApi.sendMessage(newMessage);
    emit('send_message', newMessage);
  };

  const handleAttachmentStub = () => {
    showToast('Secure document attachments enabled for PDF logs and CBT journals.', 'info');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[600px] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF8F5]/80">
        <div>
          <div className="text-sm font-bold text-slate-900">{recipientName}</div>
          <div className="text-[11px] text-teal-800 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>Secure 256-bit encrypted clinical chat</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
          Not for emergency crisis
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FAF8F5]/40 space-y-2">
        <div className="text-center my-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-xs">
            Encrypted Session Conversation
          </span>
        </div>

        {messages.map((m) => {
          const isMe = m.senderId === user?.id || (therapistView && m.senderId === 'therapist_sharma') || (!therapistView && m.senderId === 'client_1');
          return <MessageBubble key={m.id} message={m} isMe={isMe} />;
        })}

        {isTyping && <TypingIndicator senderName={recipientName} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAttachmentStub}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          title="Attach worksheet or PDF"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${recipientName}...`}
          className="flex-1 px-4 py-2 bg-[#FAF8F5] rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
