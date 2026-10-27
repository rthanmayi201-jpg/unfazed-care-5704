import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Video, 
  FileText, 
  Receipt, 
  Package, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { schedulingApi, noteApi, paymentApi, therapistApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import InvoiceView from '../../components/payments/InvoiceView.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';

export default function ClientPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [therapist, setTherapist] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions'); // sessions | notes | packages | invoices

  useEffect(() => {
    let mounted = true;
    async function loadPortal() {
      try {
        const clientId = user?.id || 'client_1';
        const [sData, nData, iData, pData, tData] = await Promise.all([
          schedulingApi.getClientSessions(clientId),
          noteApi.getSharedNotesForClient(clientId),
          paymentApi.getClientInvoices(clientId),
          paymentApi.getClientPackages(clientId),
          therapistApi.getProfile('therapist_sharma')
        ]);
        if (mounted) {
          setSessions(sData || []);
          setSharedNotes(nData || []);
          setInvoices(iData || []);
          setPackages(pData || []);
          setTherapist(tData);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPortal();
    return () => { mounted = false; };
  }, [user]);

  if (loading) {
    return <Loader text="Loading your private client portal..." />;
  }

  if (selectedInvoice) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <InvoiceView
          payment={selectedInvoice}
          therapist={therapist}
          onBack={() => setSelectedInvoice(null)}
        />
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'confirmed');
  const pastSessions = sessions.filter(s => s.status !== 'confirmed');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">
            Client Therapy Space
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Aarav'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg leading-relaxed">
            Consulting with <strong>{therapist?.name || 'Dr. Neha Sharma'}</strong>. Access your upcoming Google Meet appointments, shared grounding takeaways, and tax receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link to="/portal/chat">
            <Button variant="secondary" size="sm" icon={MessageSquare} className="text-xs">
              Chat with Therapist
            </Button>
          </Link>
          <Link to="/dr-sharma/book">
            <Button variant="primary" size="sm" icon={Calendar} className="text-xs font-semibold">
              Book Another Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'sessions', label: `Appointments (${sessions.length})` },
          { key: 'notes', label: `Shared Session Takeaways (${sharedNotes.length})` },
          { key: 'packages', label: `Active Packages (${packages.length})` },
          { key: 'invoices', label: `Billing & Invoices (${invoices.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-teal-700 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {upcomingSessions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                <span>Upcoming Scheduled Consultations</span>
              </h2>

              <div className="divide-y divide-slate-100">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{s.serviceName}</div>
                      <div className="text-slate-500 mt-0.5 font-mono">
                        {format(new Date(s.startTime), 'EEEE, dd MMMM yyyy · h:mm a')} ({s.duration} mins)
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {s.meetLink && (
                        <a
                          href={s.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-xs transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Video Consultation</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Past Sessions History</h2>
            {pastSessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No past sessions recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pastSessions.map((s) => (
                  <div key={s.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{s.serviceName}</div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        {format(new Date(s.startTime), 'dd MMM yyyy, h:mm a')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={s.status}>{s.status.toUpperCase()}</Badge>
                      <span className="font-bold font-mono text-slate-800">{formatCurrency(s.priceINR)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Shared Reflection Notes (Read-only) */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/70 text-xs text-teal-900">
            <strong>Confidentiality Notice:</strong> The notes below represent key reflection exercises, grounding techniques, and homework frameworks shared directly by your psychologist. Private clinical documentation is protected and not displayed here.
          </div>

          {sharedNotes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-xs text-slate-400">
              No shared takeaways posted yet. Your psychologist will share takeaways after your next session.
            </div>
          ) : (
            sharedNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">{note.title}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {format(new Date(note.updatedAt), 'dd MMM yyyy')}
                  </span>
                </div>

                <div 
                  className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2"
                  dangerouslySetInnerHTML={{ __html: note.content?.html || '' }}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Packages */}
      {activeTab === 'packages' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Your Active Session Bundles</h2>
          {packages.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              You do not have any active session packages enrolled.
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-5 bg-[#FAF8F5] rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{pkg.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Purchased {format(new Date(pkg.purchasedAt), 'dd MMM yyyy')} · Valid until {format(new Date(pkg.expiresAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-teal-900 font-mono">
                      {pkg.remainingSessions} of {pkg.totalSessions} sessions left
                    </span>
                    <Badge variant="confirmed">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm font-mono">{inv.invoiceNumber}</div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    {format(new Date(inv.createdAt), 'dd MMM yyyy')} · {inv.paymentMethod}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono tabular-nums text-slate-900">{formatCurrency(inv.totalAmount)}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(inv)}
                    className="text-xs text-teal-800 hover:text-teal-900 font-semibold underline"
                  >
                    View / Print Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
