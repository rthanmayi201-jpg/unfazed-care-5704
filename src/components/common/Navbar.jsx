import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, Check, LogOut, ExternalLink, Calendar, Users, FileText, BarChart3, Settings, MessageSquare, ChevronDown, Database } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { notificationService } from '../../utils/notificationService.js';
import Avatar from './Avatar.jsx';
import Button from './Button.jsx';

export default function Navbar({ isTherapistWorkspace = false }) {
  const { user, isAuthenticated, logout, switchAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    // Initial notifications load
    setNotifications(notificationService.getHistory());

    // Subscribe to real-time notification bus
    const unsubscribe = notificationService.subscribe((newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllAsRead();
    setNotifications(updated);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <Link 
            to="/" 
            className="text-xl font-bold tracking-tight text-teal-900 hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              U
            </span>
            <span>Unfazed</span>
          </Link>

          {user?.role === 'therapist' && isTherapistWorkspace && user.slug && (
            <span className="hidden lg:inline-flex items-center text-xs text-slate-500 font-normal">
              <span className="text-slate-300 mx-2">/</span>
              <a 
                href={`/${user.slug}`} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-teal-700 underline underline-offset-4 flex items-center gap-1"
                title="View public profile"
              >
                <span>unfazed.in/{user.slug}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          )}
        </div>

        {/* Zone 2: 4-5 single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {!isAuthenticated ? (
            <>
              <Link to="/#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Features</Link>
              <Link to="/#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">How it Works</Link>
              <Link to="/#pricing" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Pricing</Link>
              <Link to="/dr-sharma" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 text-teal-800 font-semibold">Demo Practice Page</Link>
            </>
          ) : user.role === 'therapist' ? (
            <>
              <Link to="/dashboard" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname === '/dashboard' ? 'text-teal-800 font-semibold' : ''}`}>Dashboard</Link>
              <Link to="/admin" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname.startsWith('/admin') ? 'text-teal-800 font-semibold' : ''}`}>Admin DB</Link>
              <Link to="/schedule" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname === '/schedule' ? 'text-teal-800 font-semibold' : ''}`}>Schedule</Link>
              <Link to="/clients" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname.startsWith('/clients') ? 'text-teal-800 font-semibold' : ''}`}>Clients</Link>
              <Link to="/notes" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname === '/notes' ? 'text-teal-800 font-semibold' : ''}`}>Notes</Link>
              <Link to="/analytics" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname === '/analytics' ? 'text-teal-800 font-semibold' : ''}`}>Analytics</Link>
            </>

          ) : (
            <>
              <Link to="/portal" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname === '/portal' ? 'text-teal-800 font-semibold' : ''}`}>My Sessions</Link>
              <Link to="/portal/chat" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname === '/portal/chat' ? 'text-teal-800 font-semibold' : ''}`}>Therapist Chat</Link>
              <Link to="/portal/payments" className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${location.pathname === '/portal/payments' ? 'text-teal-800 font-semibold' : ''}`}>Invoices & Packages</Link>
              <Link to="/dr-sharma/book" className="text-teal-800 font-semibold hover:text-teal-900 transition-colors whitespace-nowrap shrink-0">Book Session</Link>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action & Interactive Menus */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              {/* Notification Center */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Open notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                        <span>Practice Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[11px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-teal-700 hover:text-teal-800 font-medium hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((item) => (
                          <div key={item.id} className={`py-3 text-xs ${item.read ? 'opacity-70' : 'bg-teal-50/40 rounded-lg px-2'}`}>
                            <div className="flex items-center justify-between font-medium text-slate-800">
                              <span>{item.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                              <span>Channel: <strong className="text-slate-600 uppercase font-mono">{item.channel}</strong></span>
                              <span>·</span>
                              <span>Status: {item.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                      <Link 
                        to="/notifications" 
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-teal-700 hover:text-teal-800 font-medium"
                      >
                        View Full Notification Log →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Profile & Fast Demo Switcher */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <div className="font-semibold text-sm text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      <div className="mt-1 text-[11px] text-teal-800 font-medium">Role: {user.role.toUpperCase()}</div>
                    </div>

                    {/* Switch role quick toggle */}
                    <div className="px-3 py-1.5 mb-2 bg-slate-50 rounded-xl">
                      <div className="text-[11px] font-semibold text-slate-600 mb-1.5">Switch Demo Persona:</div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { switchAccount('therapist'); setShowUserMenu(false); navigate('/dashboard'); }}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                            user.role === 'therapist' ? 'bg-teal-700 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Therapist
                        </button>
                        <button
                          onClick={() => { switchAccount('client'); setShowUserMenu(false); navigate('/portal'); }}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                            user.role === 'client' ? 'bg-teal-700 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Client
                        </button>
                      </div>
                    </div>

                    {user.role === 'therapist' ? (
                      <>
                        <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 rounded-lg">
                          <Database className="w-4 h-4 text-teal-700" />
                          <span>Admin Bookings DB</span>
                        </Link>
                        <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg">
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Practice Settings</span>
                        </Link>

                        <Link to="/billing" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg">
                          <BarChart3 className="w-4 h-4 text-slate-400" />
                          <span>Billing & GST Invoices</span>
                        </Link>
                        <Link to="/plans" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg">
                          <span className="w-4 h-4 text-purple-600 font-bold text-center">★</span>
                          <span>Subscription Tier</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/portal" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>My Bookings</span>
                        </Link>
                        <Link to="/portal/chat" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>Chat with Dr. Sharma</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); navigate('/login'); }}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap">
                Sign in
              </Link>
              <Button size="sm" onClick={() => navigate('/register')}>
                Start Practice Free
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
