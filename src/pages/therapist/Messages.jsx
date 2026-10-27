import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { clientApi } from '../../api/index.js';
import ChatWindow from '../../components/chat/ChatWindow.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Loader from '../../components/common/Loader.jsx';

export default function Messages() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadConversations() {
      try {
        const data = await clientApi.getClients(user?.id || 'therapist_sharma', { limit: 10 });
        if (mounted) {
          setClients(data.clients || []);
          if (data.clients && data.clients.length > 0) {
            setSelectedClient(data.clients[0]);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadConversations();
    return () => { mounted = false; };
  }, [user]);

  if (loading) {
    return <Loader text="Loading conversations..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Client Messaging</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Direct, encrypted between-session messaging for practice updates and journal reflections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Client Conversation Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Client Threads
          </div>
          <div className="space-y-1">
            {clients.map((c) => {
              const isSelected = selectedClient?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 border border-teal-200/70'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{c.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{c.tags?.[0] || 'Client'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2">
          {selectedClient ? (
            <ChatWindow
              conversationId={`conv_sharma_${selectedClient.id}`}
              recipientName={selectedClient.name}
              recipientId={selectedClient.id}
              therapistView={true}
            />
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-xs text-slate-400">
              Select a conversation to begin chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
