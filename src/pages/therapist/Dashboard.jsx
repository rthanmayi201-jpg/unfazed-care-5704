import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  MessageSquare, 
  Video, 
  Plus, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { schedulingApi, clientApi, analyticsApi } from '../../api/index.js';
import StatCard from '../../components/analytics/StatCard.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Loader from '../../components/common/Loader.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';
import { useToast } from '../../context/ToastContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDashboardData() {
      try {
        const [sessData, clientData, analData] = await Promise.all([
          schedulingApi.getSessions(user?.id || 'therapist_sharma'),
          clientApi.getClients(user?.id || 'therapist_sharma', { limit: 5 }),
          analyticsApi.getAnalytics(user?.id || 'therapist_sharma', 30)
        ]);
        if (mounted) {
          setSessions(sessData);
          setClients(clientData.clients || []);
          setAnalytics(analData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => { mounted = false; };
  }, [user]);

  const slug = user?.slug || 'dr-sharma';
  const publicUrl = `${window.location.origin}/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Branded link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <Loader text="Loading your practice dashboard..." />;
  }

  const upcomingSessions = sessions
    .filter(s => s.status === 'confirmed')
    .slice(0, 4);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner & Branded Link Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-800 mb-1">
              Private Practice Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Good morning, {user?.name || 'Dr. Sharma'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
              You have <strong>{upcomingSessions.length} upcoming consultations</strong> scheduled this week. Client notes and intake submissions are synced in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/notes')}
              className="text-xs font-semibold"
            >
              Document Clinical Note
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Calendar}
              onClick={() => navigate('/schedule')}
              className="text-xs font-semibold"
            >
              View Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Users}
              onClick={() => navigate('/clients')}
              className="text-xs font-semibold"
            >
              Client CRM
            </Button>
          </div>
        </div>

        {/* Branded Link Card */}
        <div className="bg-gradient-to-br from-teal-900 to-teal-950 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-teal-200 uppercase tracking-wider">
                Your Branded Booking Link
              </span>
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-teal-300 hover:text-white"
                title="Open public page"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="text-sm sm:text-base font-mono font-bold text-teal-100 bg-white/10 p-3 rounded-xl border border-white/15 break-all select-all">
              unfazed.in/{slug}
            </div>

            <p className="text-xs text-teal-200/80 mt-2.5 leading-relaxed">
              Share this single link on your Instagram bio, WhatsApp, or Google Business profile for automated client acquisition and payment collection.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Branded Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue (30 Days)"
          value={formatCurrency(analytics?.totalRevenue || 45000)}
          change="+18.4%"
          isPositive={true}
          subtext="vs last month"
          icon={IndianRupee}
        />
        <StatCard
          title="Active Practice Clients"
          value={analytics?.activeClientsCount || 12}
          change="+2 new"
          isPositive={true}
          subtext="enrolled this month"
          icon={Users}
        />
        <StatCard
          title="Scheduled Sessions"
          value={upcomingSessions.length}
          subtext="confirmed appointments"
          icon={Calendar}
        />
        <StatCard
          title="No-Show Rate"
          value={`${analytics?.noShowRate || 4}%`}
          change="-2.1%"
          isPositive={true}
          subtext="industry avg: 14%"
          icon={Clock}
        />
      </div>

      {/* Two Column Layout: Upcoming Sessions & Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Upcoming Consultations</h2>
              <p className="text-xs text-slate-500">Upcoming confirmed telehealth appointments</p>
            </div>
            <Link to="/schedule" className="text-xs font-semibold text-teal-800 hover:underline">
              View Calendar →
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No upcoming appointments this week.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingSessions.map((s) => (
                <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.clientName} size="sm" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">{s.clientName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono tabular-nums">
                          {format(new Date(s.startTime), 'EEE, dd MMM · h:mm a')}
                        </span>
                        <span>·</span>
                        <span>{s.duration} mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {s.meetLink && (
                      <a
                        href={s.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl transition-colors"
                        title="Join Google Meet video call"
                      >
                        <Video className="w-4 h-4" />
                      </a>
                    )}
                    <Link
                      to="/schedule"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 p-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Clients Quick CRM */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Client Roster</h2>
              <p className="text-xs text-slate-500">Quick access to client profiles and clinical records</p>
            </div>
            <Link to="/clients" className="text-xs font-semibold text-teal-800 hover:underline">
              Full Client Table →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {clients.slice(0, 4).map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size="sm" />
                  <div>
                    <Link to={`/clients/${c.id}`} className="font-bold text-xs sm:text-sm text-slate-900 hover:text-teal-800">
                      {c.name}
                    </Link>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(c.tags || []).slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(c.totalPaid)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {c.sessionsCompleted} sessions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
