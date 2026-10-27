import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  BarChart2, 
  Package, 
  MessageSquare, 
  Bell, 
  Receipt, 
  Settings, 
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import TierBadge from '../entitlement/TierBadge.jsx';

export default function Sidebar() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const slug = user?.slug || 'dr-sharma';
  const publicUrl = `${window.location.origin}/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Branded link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin', label: 'Admin Bookings DB', icon: Database, isHighlight: true },
    { to: '/schedule', label: 'Schedule & Calendar', icon: Calendar },
    { to: '/clients', label: 'Client CRM', icon: Users },
    { to: '/notes', label: 'Clinical Documentation', icon: FileText },
    { to: '/analytics', label: 'Practice Analytics', icon: BarChart2 },
    { to: '/packages', label: 'Session Packages', icon: Package },
    { to: '/messages', label: 'Client Messages', icon: MessageSquare },
    { to: '/billing', label: 'Billing & Invoices', icon: Receipt },
    { to: '/notifications', label: 'Notification Log', icon: Bell },
    { to: '/plans', label: 'Plan & Entitlements', icon: Sparkles },
    { to: '/settings', label: 'Practice Settings', icon: Settings },
  ];


  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Therapist mini profile banner */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 font-medium">Practice Portal</div>
          <div className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Dr. Sharma'}</div>
        </div>
        <TierBadge />
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50/90 text-teal-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-600" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Branded link promo card at bottom */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-[#FAF8F5] rounded-xl p-3 border border-slate-200/70">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span>Your Branded Link</span>
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-teal-700 hover:text-teal-900"
              title="Open public page"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="text-xs text-slate-500 font-mono truncate mb-2.5">
            unfazed.in/{slug}
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-xs font-medium shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy Public Link'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
