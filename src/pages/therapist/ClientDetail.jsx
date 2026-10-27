import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Receipt, 
  FileText, 
  Package, 
  Plus, 
  CheckCircle2, 
  User, 
  Clock,
  Heart
} from 'lucide-react';
import { clientApi, schedulingApi, paymentApi, noteApi } from '../../api/index.js';
import Avatar from '../../components/common/Avatar.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import NoteList from '../../components/notes/NoteList.jsx';
import NoteEditor from '../../components/notes/NoteEditor.jsx';
import TagInput from '../../components/crm/TagInput.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';
import { useToast } from '../../context/ToastContext.jsx';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [clientPackages, setClientPackages] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview | sessions | notes | intake | payments | packages
  const [editingNotes, setEditingNotes] = useState(false);
  const [selectedNoteForEdit, setSelectedNoteForEdit] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadClientData() {
      try {
        const [cData, sData, pData, nData, pkgData] = await Promise.all([
          clientApi.getClientById(id),
          schedulingApi.getClientSessions(id),
          paymentApi.getClientInvoices(id),
          noteApi.getNotesForClient(id, 'therapist_sharma'),
          paymentApi.getClientPackages(id)
        ]);
        if (mounted) {
          setClient(cData);
          setSessions(sData || []);
          setPayments(pData || []);
          setNotes(nData || []);
          setClientPackages(pkgData || []);
        }
      } catch (err) {
        showToast('Failed to load client details: ' + err.message, 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadClientData();
    return () => { mounted = false; };
  }, [id]);

  const handleSaveNote = async (notePayload) => {
    try {
      const saved = await noteApi.saveNote({ ...notePayload, clientId: id, therapistId: 'therapist_sharma' });
      const updatedNotes = await noteApi.getNotesForClient(id, 'therapist_sharma');
      setNotes(updatedNotes);
      setEditingNotes(false);
      setSelectedNoteForEdit(null);
      showToast('Note saved!', 'success');
    } catch (err) {
      showToast('Error saving note: ' + err.message, 'error');
    }
  };

  const handleUpdateTags = async (newTags) => {
    try {
      const updated = await clientApi.updateClient(id, { tags: newTags });
      setClient(updated);
      showToast('Clinical tags updated', 'success');
    } catch (err) {
      showToast('Failed to update tags', 'error');
    }
  };

  if (loading) {
    return <Loader text="Loading client profile..." />;
  }

  if (!client) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Client Record Not Found</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/clients')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link to="/clients" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-800">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Client CRM</span>
        </Link>
      </div>

      {/* Client Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <Avatar name={client.name} size="xl" className="ring-4 ring-teal-50" />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{client.name}</h1>
              <Badge variant={client.status === 'active' ? 'confirmed' : client.status === 'new' ? 'pending' : 'cancelled'}>
                {client.status.toUpperCase()}
              </Badge>
              {client.consentSigned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Consent Verified</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.email}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.phone}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Client since {format(new Date(client.joinedDate || Date.now()), 'MMM yyyy')}</span>
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <TagInput tags={client.tags || []} onChange={handleUpdateTags} placeholder="Add tag..." />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setSelectedNoteForEdit(null);
              setEditingNotes(true);
              setActiveTab('notes');
            }}
            className="text-xs"
          >
            New Session Note
          </Button>
          <Link to="/messages">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Open Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'overview', label: 'Overview & Stats' },
          { key: 'sessions', label: `Sessions (${sessions.length})` },
          { key: 'notes', label: `Clinical Documentation (${notes.length})` },
          { key: 'intake', label: 'Intake & Consent' },
          { key: 'payments', label: `Billing & Invoices (${payments.length})` },
          { key: 'packages', label: `Packages (${clientPackages.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key !== 'notes') setEditingNotes(false);
            }}
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

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Stats</div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Sessions Completed:</span>
                <span className="font-bold text-slate-800">{client.sessionsCompleted}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Total Billed:</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">{formatCurrency(client.totalPaid)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Next Scheduled:</span>
                <span className="font-medium text-teal-800 font-mono">
                  {client.nextSession ? format(new Date(client.nextSession), 'dd MMM, h:mm a') : 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</div>
            {client.emergencyContact?.name ? (
              <div className="space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-900 text-sm">{client.emergencyContact.name}</div>
                <div>Relationship: <strong>{client.emergencyContact.relation}</strong></div>
                <div className="font-mono">{client.emergencyContact.phone}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No emergency contact recorded yet.</div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Packages</div>
            {clientPackages.length > 0 ? (
              <div className="space-y-2 text-xs">
                {clientPackages.map(pkg => (
                  <div key={pkg.id} className="p-3 bg-teal-50 rounded-xl border border-teal-200/60">
                    <div className="font-bold text-teal-900">{pkg.title}</div>
                    <div className="text-[11px] text-teal-700 mt-1">
                      {pkg.remainingSessions} of {pkg.totalSessions} sessions remaining
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No package bundles purchased.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <div key={s.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{s.serviceName}</div>
                  <div className="text-slate-500 mt-0.5 font-mono tabular-nums">
                    {format(new Date(s.startTime), 'EEEE, dd MMM yyyy · h:mm a')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={s.status}>{s.status.toUpperCase()}</Badge>
                  <span className="font-bold font-mono tabular-nums text-slate-900">{formatCurrency(s.priceINR)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {editingNotes ? (
            <NoteEditor
              initialNote={selectedNoteForEdit}
              clients={[client]}
              sessions={sessions}
              onSaveNote={handleSaveNote}
              onCancel={() => {
                setEditingNotes(false);
                setSelectedNoteForEdit(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    setSelectedNoteForEdit(null);
                    setEditingNotes(true);
                  }}
                  className="text-xs"
                >
                  Create Clinical Note
                </Button>
              </div>
              <NoteList
                notes={notes}
                clients={[client]}
                onSelectNote={(n) => {
                  setSelectedNoteForEdit(n);
                  setEditingNotes(true);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Intake & Consent */}
      {activeTab === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Intake Questionnaire Status</h3>
            {client.intakeCompleted ? (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Clinical intake completed and reviewed.</span>
                </div>
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-slate-200/60 space-y-2">
                  <div><strong>Presenting Concern:</strong> Chronic anxiety and cognitive catastrophic reframing.</div>
                  <div><strong>Severity Score:</strong> 7 / 10</div>
                  <div><strong>Prior Therapy Experience:</strong> Yes (CBT in 2024)</div>
                  <div><strong>Current Medications:</strong> None reported</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
                Client has not completed the clinical intake questionnaire yet. An automated reminder has been queued.
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Informed Consent Audit Trail</h3>
            {client.consentSigned ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Legally binding informed consent signed.</span>
                </div>
                <div className="divide-y divide-slate-100 bg-[#FAF8F5] p-3 rounded-xl border border-slate-200/60 font-mono text-[11px] text-slate-600">
                  {(client.consentAuditLog || []).map((entry, idx) => (
                    <div key={idx} className="py-2">
                      <div className="font-semibold text-slate-800">{entry.action}</div>
                      <div>Signer: {entry.signature}</div>
                      <div>Date: {format(new Date(entry.timestamp), 'dd MMM yyyy, h:mm:ss a')}</div>
                      <div>IP: {entry.ip}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-700 bg-rose-50 p-4 rounded-xl border border-rose-200">
                Consent form pending. First session confirmation requires verified informed consent.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm font-mono">{p.invoiceNumber}</div>
                  <div className="text-slate-500 mt-0.5">
                    {format(new Date(p.createdAt), 'dd MMM yyyy')} · {p.paymentMethod}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={p.status}>{p.status.toUpperCase()}</Badge>
                  <span className="font-bold font-mono tabular-nums text-slate-900">{formatCurrency(p.totalAmount)}</span>
                  <Link
                    to={`/billing?invoice=${p.id}`}
                    className="text-xs text-teal-800 hover:underline font-semibold"
                  >
                    View Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Packages */}
      {activeTab === 'packages' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          {clientPackages.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No active package enrolled.
            </div>
          ) : (
            <div className="space-y-4">
              {clientPackages.map((cpkg) => (
                <div key={cpkg.id} className="p-5 bg-[#FAF8F5] rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cpkg.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Purchased on {format(new Date(cpkg.purchasedAt), 'dd MMM yyyy')} · Valid until {format(new Date(cpkg.expiresAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-teal-900 font-mono">
                      {cpkg.remainingSessions} / {cpkg.totalSessions} sessions left
                    </span>
                    <Badge variant="confirmed">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
