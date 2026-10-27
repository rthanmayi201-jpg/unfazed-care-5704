import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Calendar, 
  Clock, 
  Users, 
  IndianRupee, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  XCircle, 
  CheckCircle2, 
  Eye, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Video, 
  Phone, 
  Mail, 
  FileText, 
  SlidersHorizontal,
  ChevronDown,
  Info,
  ShieldCheck,
  Server
} from 'lucide-react';
import { 
  getAllSupabaseBookings, 
  updateSupabaseAppointment, 
  cancelSupabaseAppointment, 
  deleteSupabaseAppointment, 
  saveAppointmentToSupabase,
  testSupabaseConnection, 
  getSupabaseConfig 
} from '../../api/supabaseClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';

export default function AdminBookingsDashboard() {
  const { showToast } = useToast();

  // State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Connection & Diagnostics
  const [dbStatus, setDbStatus] = useState({ connected: true, checking: false, details: null });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const config = getSupabaseConfig();

  // Modal States
  const [viewingBooking, setViewingBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [deletingBooking, setDeletingBooking] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [cancelReason, setCancelReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // New Booking Form state
  const [newBooking, setNewBooking] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_name: 'Cognitive Behavioral Therapy (CBT)',
    duration_minutes: 60,
    start_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    price_inr: 1500,
    payment_status: 'paid',
    payment_method: 'razorpay',
    status: 'confirmed',
    notes: 'Created via Admin Dashboard'
  });

  // Load Bookings from Supabase
  const loadBookings = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAllSupabaseBookings({ limit: 200 });
      if (res.success) {
        setBookings(res.data || []);
        setLastRefreshed(new Date());
        if (isManualRefresh) {
          showToast(`Successfully refreshed ${res.data?.length || 0} bookings from Supabase!`, 'success');
        }
      } else {
        showToast(`Failed to fetch bookings: ${res.error}`, 'error');
      }
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
      showToast('Error querying Supabase database', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Run on mount
  useEffect(() => {
    loadBookings();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setDbStatus(prev => ({ ...prev, checking: true }));
    const health = await testSupabaseConnection();
    setDbStatus({
      connected: health.connected,
      checking: false,
      details: health
    });
  };

  // Handle Copy
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Status Change
  const handleQuickStatusChange = async (booking, newStatus) => {
    setSubmittingAction(true);
    try {
      const res = await updateSupabaseAppointment(
        booking.id, 
        { status: newStatus }, 
        booking.linkedBookingId
      );

      if (res.success) {
        setBookings(prev => prev.map(b => (b.id === booking.id ? { ...b, status: newStatus } : b)));
        showToast(`Appointment status updated to "${newStatus}" in Supabase!`, 'success');
      } else {
        showToast(`Update failed: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Save Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSubmittingAction(true);

    const updates = {
      client_name: editingBooking.client_name,
      client_email: editingBooking.client_email,
      client_phone: editingBooking.client_phone,
      service_name: editingBooking.service_name,
      duration_minutes: Number(editingBooking.duration_minutes) || 60,
      start_time: new Date(editingBooking.start_time).toISOString(),
      end_time: new Date(new Date(editingBooking.start_time).getTime() + (Number(editingBooking.duration_minutes) || 60) * 60000).toISOString(),
      price_inr: Number(editingBooking.price_inr) || 0,
      payment_status: editingBooking.payment_status,
      status: editingBooking.status,
      meet_link: editingBooking.meet_link,
      notes: editingBooking.notes
    };

    try {
      const res = await updateSupabaseAppointment(
        editingBooking.id, 
        updates, 
        editingBooking.linkedBookingId
      );

      if (res.success) {
        setBookings(prev => prev.map(b => (b.id === editingBooking.id ? { ...b, ...updates } : b)));
        showToast('Appointment successfully updated in Supabase database!', 'success');
        setEditingBooking(null);
      } else {
        showToast(`Failed to update: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast(`Error updating appointment: ${err.message}`, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Confirm Cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setSubmittingAction(true);

    try {
      const res = await cancelSupabaseAppointment(
        cancellingBooking.id, 
        cancelReason, 
        cancellingBooking.linkedBookingId
      );

      if (res.success) {
        setBookings(prev => prev.map(b => {
          if (b.id === cancellingBooking.id) {
            return {
              ...b,
              status: 'cancelled',
              notes: cancelReason ? `[Cancelled by Admin: ${cancelReason}] ${b.notes || ''}` : `[Cancelled by Admin] ${b.notes || ''}`
            };
          }
          return b;
        }));
        showToast('Appointment has been marked as cancelled in Supabase!', 'success');
        setCancellingBooking(null);
        setCancelReason('');
      } else {
        showToast(`Failed to cancel: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Confirm Deletion
  const handleConfirmDelete = async () => {
    if (!deletingBooking) return;
    setSubmittingAction(true);

    try {
      const res = await deleteSupabaseAppointment(
        deletingBooking.id, 
        deletingBooking.linkedBookingId
      );

      if (res.success) {
        setBookings(prev => prev.filter(b => b.id !== deletingBooking.id));
        showToast('Appointment record removed from Supabase database!', 'success');
        setDeletingBooking(null);
      } else {
        showToast(`Failed to delete: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Manual Create Booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);

    try {
      const startTime = new Date(newBooking.start_time).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + Number(newBooking.duration_minutes) * 60000).toISOString();
      const payload = {
        clientName: newBooking.client_name,
        clientEmail: newBooking.client_email,
        clientPhone: newBooking.client_phone,
        serviceName: newBooking.service_name,
        duration: Number(newBooking.duration_minutes),
        startTime,
        endTime,
        priceINR: Number(newBooking.price_inr),
        paymentStatus: newBooking.payment_status,
        paymentMethod: newBooking.payment_method,
        status: newBooking.status,
        notes: newBooking.notes
      };

      const res = await saveAppointmentToSupabase(payload);
      if (res.success) {
        showToast(`New appointment saved to Supabase (${res.table})!`, 'success');
        setShowCreateModal(false);
        // Refresh live list
        loadBookings();
        // Reset form
        setNewBooking({
          client_name: '',
          client_email: '',
          client_phone: '',
          service_name: 'Cognitive Behavioral Therapy (CBT)',
          duration_minutes: 60,
          start_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
          price_inr: 1500,
          payment_status: 'paid',
          payment_method: 'razorpay',
          status: 'confirmed',
          notes: 'Created via Admin Dashboard'
        });
      } else {
        showToast(`Failed to create: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      showToast('No booking data available to export.', 'info');
      return;
    }

    const headers = [
      'ID',
      'Client Name',
      'Client Email',
      'Client Phone',
      'Service Name',
      'Duration (mins)',
      'Start Time',
      'End Time',
      'Price (INR)',
      'Payment Status',
      'Payment Method',
      'Status',
      'Meet Link',
      'Notes',
      'Created At',
      'Supabase Tables'
    ];

    const rows = bookings.map(b => [
      `"${b.id || ''}"`,
      `"${(b.client_name || '').replace(/"/g, '""')}"`,
      `"${(b.client_email || '').replace(/"/g, '""')}"`,
      `"${(b.client_phone || '').replace(/"/g, '""')}"`,
      `"${(b.service_name || '').replace(/"/g, '""')}"`,
      b.duration_minutes || 60,
      `"${b.start_time || ''}"`,
      `"${b.end_time || ''}"`,
      b.price_inr || 0,
      `"${b.payment_status || ''}"`,
      `"${b.payment_method || ''}"`,
      `"${b.status || ''}"`,
      `"${b.meet_link || ''}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
      `"${b.created_at || ''}"`,
      `"${(b._tables || ['appointments']).join(' + ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `unfazed_supabase_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported all bookings to CSV!', 'success');
  };

  // Compute Metrics & KPI stats
  const metrics = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.status !== 'cancelled' && (b.payment_status === 'paid' || b.payment_status === 'confirmed'))
      .reduce((sum, b) => sum + (Number(b.price_inr) || 0), 0);

    return { total, confirmed, completed, cancelled, totalRevenue };
  }, [bookings]);

  // Filtered & Sorted Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = (b.client_name || '').toLowerCase().includes(query);
        const matchEmail = (b.client_email || '').toLowerCase().includes(query);
        const matchPhone = (b.client_phone || '').toLowerCase().includes(query);
        const matchService = (b.service_name || '').toLowerCase().includes(query);
        const matchId = (b.id || '').toLowerCase().includes(query);
        const matchNotes = (b.notes || '').toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchPhone && !matchService && !matchId && !matchNotes) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }

      // Table filter
      if (tableFilter !== 'all') {
        const tables = b._tables || [b._sourceTable || 'appointments'];
        if (!tables.includes(tableFilter)) return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        if (paymentFilter === 'paid' && b.payment_status !== 'paid' && b.payment_status !== 'confirmed') return false;
        if (paymentFilter === 'pending' && b.payment_status === 'paid') return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.start_time || b.created_at || 0) - new Date(a.start_time || a.created_at || 0);
      }
      if (sortBy === 'date_asc') {
        return new Date(a.start_time || a.created_at || 0) - new Date(b.start_time || b.created_at || 0);
      }
      if (sortBy === 'name_asc') {
        return (a.client_name || '').localeCompare(b.client_name || '');
      }
      if (sortBy === 'price_desc') {
        return (b.price_inr || 0) - (a.price_inr || 0);
      }
      return 0;
    });
  }, [bookings, searchQuery, statusFilter, tableFilter, paymentFilter, sortBy]);

  // Format Helpers
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="primary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="warning">Rescheduled</Badge>;
      default:
        return <Badge variant="neutral">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-800 mb-1">
            <Database className="w-4 h-4 text-teal-700" />
            <span>Supabase Database Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Booking & Appointment Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Live interface directly connected to Supabase backend project <code className="bg-slate-100 text-teal-900 px-1.5 py-0.5 rounded font-mono font-semibold">{config.projectId}</code>. View, manage, edit, and cancel appointments in real time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => checkConnection()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition-colors"
            title="Check connection to Supabase"
          >
            <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="hidden sm:inline">Supabase</span>
            <span className="font-semibold text-slate-800">{dbStatus.connected ? 'Connected' : 'Offline'}</span>
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadBookings(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-700' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </Button>
        </div>
      </div>

      {/* Database Status Strip */}
      <div className="bg-teal-950 text-teal-100 rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Connected Backend:</span>
          </div>
          <span className="font-mono text-white bg-teal-900/80 px-2 py-0.5 rounded border border-teal-800">
            {config.url}
          </span>
          <span className="text-teal-400">·</span>
          <span>Dual Sync Active on <code className="text-teal-200 font-mono">appointments</code> & <code className="text-teal-200 font-mono">bookings</code> tables</span>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-teal-300/80">
              Last synced: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => setShowConfigModal(true)}
            className="text-teal-200 hover:text-white underline underline-offset-2 font-medium"
          >
            View DB Details
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Total Bookings</span>
            <Database className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all Supabase tables</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Confirmed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{metrics.confirmed}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">Ready for consultation</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{metrics.completed}</div>
          <div className="text-[11px] text-blue-600/80 mt-1">Sessions conducted</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{metrics.cancelled}</div>
          <div className="text-[11px] text-rose-500/80 mt-1">Cancelled by client/admin</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Total Value</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">From valid appointments</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, email, phone, service, or booking ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    statusFilter === st 
                      ? 'bg-white text-teal-900 shadow-xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Table Filter Dropdown */}
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              <option value="all">All Supabase Tables</option>
              <option value="appointments">Table: appointments</option>
              <option value="bookings">Table: bookings</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid / Confirmed</option>
              <option value="pending">Pending</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              <option value="date_desc">Newest Session First</option>
              <option value="date_asc">Oldest Session First</option>
              <option value="name_asc">Client Name (A-Z)</option>
              <option value="price_desc">Highest Price First</option>
            </select>
          </div>
        </div>

        {/* Filter stats bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800">{filteredBookings.length}</strong> of <strong className="text-slate-800">{bookings.length}</strong> bookings stored in Supabase
          </div>
          {(searchQuery || statusFilter !== 'all' || tableFilter !== 'all' || paymentFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTableFilter('all');
                setPaymentFilter('all');
              }}
              className="text-teal-700 hover:text-teal-900 font-medium hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Bookings Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-teal-700 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-700">Connecting to Supabase and retrieving records...</p>
            <p className="text-xs text-slate-400">Querying both appointments and bookings tables</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No bookings found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'No appointments currently recorded in the Supabase tables. Click "New Booking" to insert one.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Add Test Booking
              </Button>
              <Button size="sm" variant="outline" onClick={() => loadBookings(true)}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Reload from Supabase
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-3.5 px-4">Client Details</th>
                  <th className="py-3.5 px-4">Service & Duration</th>
                  <th className="py-3.5 px-4">Scheduled Date & Time</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">DB Source</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBookings.map((b) => (
                  <tr 
                    key={b.id} 
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Client Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{b.client_name || 'Anonymous Client'}</div>
                      <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-slate-500">
                        {b.client_email && (
                          <span className="flex items-center gap-1.5 truncate max-w-[200px]" title={b.client_email}>
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <a href={`mailto:${b.client_email}`} className="hover:text-teal-700 truncate">{b.client_email}</a>
                          </span>
                        )}
                        {b.client_phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <a href={`tel:${b.client_phone}`} className="hover:text-teal-700">{b.client_phone}</a>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Service & Duration */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{b.service_name || 'Consultation'}</div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {b.duration_minutes || 60} mins
                        </span>
                        {b.meet_link && (
                          <a 
                            href={b.meet_link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 underline underline-offset-2"
                            title="Join video session"
                          >
                            <Video className="w-3 h-3" />
                            <span>Meet</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{formatDateTime(b.start_time)}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Booked: {b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : 'N/A'}
                      </div>
                    </td>

                    {/* Price & Payment */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(b.price_inr || 0)}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                          b.payment_status === 'paid' || b.payment_status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}>
                          {b.payment_status || 'pending'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(b.status)}
                      </div>
                    </td>

                    {/* Database Source Table Pill */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {(b._tables || ['appointments']).map((tbl) => (
                          <span 
                            key={tbl}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded border border-slate-200"
                            title={`Stored in Supabase table: ${tbl}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                            {tbl}
                          </span>
                        ))}
                        <button
                          onClick={() => handleCopy(b.id, b.id)}
                          className="text-[10px] text-slate-400 font-mono hover:text-slate-600 flex items-center gap-1 mt-0.5"
                          title="Copy Supabase Record UUID"
                        >
                          <span>{b.id?.slice(0, 8)}...</span>
                          {copiedId === b.id ? <Check className="w-2.5 h-2.5 text-teal-600" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => setViewingBooking(b)}
                          className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View complete booking details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Record */}
                        <button
                          onClick={() => setEditingBooking({ ...b })}
                          className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit appointment details in Supabase"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Quick Status Dropdown / Cancel */}
                        {b.status !== 'cancelled' ? (
                          <button
                            onClick={() => {
                              setCancellingBooking(b);
                              setCancelReason('');
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel appointment in Supabase"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatusChange(b, 'confirmed')}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Re-confirm appointment"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Record */}
                        <button
                          onClick={() => setDeletingBooking(b)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete from Supabase database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Appointment Breakdown</h3>
                  <div className="text-[11px] text-slate-500">Live Supabase database record</div>
                </div>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Client Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Client Information</div>
                <div className="text-sm font-bold text-slate-900">{viewingBooking.client_name}</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400">Email: </span>
                    <a href={`mailto:${viewingBooking.client_email}`} className="text-teal-700 underline truncate block">{viewingBooking.client_email || 'N/A'}</a>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone: </span>
                    <a href={`tel:${viewingBooking.client_phone}`} className="text-teal-700 underline block">{viewingBooking.client_phone || 'N/A'}</a>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Service</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewingBooking.service_name || 'N/A'}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{viewingBooking.duration_minutes || 60} minutes</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Status & Payment</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {getStatusBadge(viewingBooking.status)}
                    <span className="text-slate-700 font-semibold">{formatCurrency(viewingBooking.price_inr || 0)}</span>
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1 capitalize">
                    {viewingBooking.payment_status} via {viewingBooking.payment_method || 'razorpay'}
                  </div>
                </div>
              </div>

              {/* Scheduled Time */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Session Date & Time</div>
                <div className="font-medium text-slate-800">{formatDateTime(viewingBooking.start_time)}</div>
                {viewingBooking.end_time && (
                  <div className="text-slate-500 text-[11px]">Until: {formatDateTime(viewingBooking.end_time)}</div>
                )}
              </div>

              {/* Video Link */}
              {viewingBooking.meet_link && (
                <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-teal-900 font-semibold text-xs flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-teal-700" />
                      <span>Google Meet Room</span>
                    </div>
                    <div className="text-teal-800 text-[11px] font-mono truncate max-w-[240px] mt-0.5">
                      {viewingBooking.meet_link}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(viewingBooking.meet_link, 'view_meet')}
                      className="p-1.5 bg-white text-teal-800 rounded-lg border border-teal-200 hover:bg-teal-50"
                      title="Copy Link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={viewingBooking.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-teal-800 text-white rounded-lg font-medium hover:bg-teal-900"
                    >
                      Join
                    </a>
                  </div>
                </div>
              )}

              {/* Database Metadata */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400 text-[10px] uppercase font-semibold font-sans">Supabase Metadata</div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Record ID:</span>
                  <span className="text-slate-900 select-all font-bold">{viewingBooking.id}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tables:</span>
                  <span className="text-teal-800 font-bold">{(viewingBooking._tables || ['appointments']).join(' & ')}</span>
                </div>
                {viewingBooking.created_at && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Created:</span>
                    <span>{new Date(viewingBooking.created_at).toISOString()}</span>
                  </div>
                )}
                {viewingBooking.notes && (
                  <div className="pt-1.5 border-t border-slate-200/60 font-sans text-slate-700">
                    <span className="font-semibold text-slate-900">Notes: </span>
                    {viewingBooking.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingBooking(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingBooking({ ...viewingBooking });
                  setViewingBooking(null);
                }}
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit This Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Appointment</h3>
                <p className="text-[11px] text-slate-500">Updates will be saved directly into Supabase database</p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingBooking.client_name || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, client_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Email</label>
                  <input
                    type="email"
                    value={editingBooking.client_email || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, client_email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Phone</label>
                  <input
                    type="tel"
                    value={editingBooking.client_phone || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, client_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingBooking.service_name || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, service_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={editingBooking.start_time ? new Date(editingBooking.start_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, start_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={editingBooking.duration_minutes || 60}
                    onChange={(e) => setEditingBooking({ ...editingBooking, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={editingBooking.price_inr ?? 0}
                    onChange={(e) => setEditingBooking({ ...editingBooking, price_inr: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={editingBooking.status || 'confirmed'}
                    onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Status</label>
                  <select
                    value={editingBooking.payment_status || 'paid'}
                    onChange={(e) => setEditingBooking({ ...editingBooking, payment_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  >
                    <option value="paid">Paid</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Google Meet URL</label>
                <input
                  type="url"
                  value={editingBooking.meet_link || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, meet_link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Clinical / Admin Notes</label>
                <textarea
                  rows={2}
                  value={editingBooking.notes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingBooking(null)}
                  disabled={submittingAction}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingAction}
                  className="bg-teal-800 hover:bg-teal-900 text-white"
                >
                  {submittingAction ? 'Saving to Supabase...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
                <p className="text-xs text-slate-500">This will update the record status to "cancelled" in Supabase.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs mb-4">
              <div className="font-semibold text-slate-800">{cancellingBooking.client_name}</div>
              <div className="text-slate-500">{cancellingBooking.service_name} · {formatDateTime(cancellingBooking.start_time)}</div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-xs font-semibold text-slate-700">Cancellation Reason (optional)</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Client requested reschedule, emergency, conflict..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingBooking(null)}
                disabled={submittingAction}
              >
                Keep Booking
              </Button>
              <button
                onClick={handleConfirmCancel}
                disabled={submittingAction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {submittingAction ? 'Cancelling in Supabase...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE RECORD MODAL */}
      {deletingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete from Supabase?</h3>
                <p className="text-xs text-slate-500">Permanently removes this row from appointments and bookings tables.</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200/80 text-xs text-rose-900 mb-4">
              <strong>Record ID:</strong> <span className="font-mono">{deletingBooking.id}</span>
              <div className="mt-1">Client: <strong>{deletingBooking.client_name}</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingBooking(null)}
                disabled={submittingAction}
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirmDelete}
                disabled={submittingAction}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {submittingAction ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW BOOKING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Appointment</h3>
                <p className="text-[11px] text-slate-500">Directly inserts row into Supabase appointments & bookings tables</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Sengupta"
                  value={newBooking.client_name}
                  onChange={(e) => setNewBooking({ ...newBooking, client_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Email</label>
                  <input
                    type="email"
                    placeholder="diya@example.com"
                    value={newBooking.client_email}
                    onChange={(e) => setNewBooking({ ...newBooking, client_email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newBooking.client_phone}
                    onChange={(e) => setNewBooking({ ...newBooking, client_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Service *</label>
                <select
                  value={newBooking.service_name}
                  onChange={(e) => setNewBooking({ ...newBooking, service_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                >
                  <option value="Cognitive Behavioral Therapy (CBT)">Cognitive Behavioral Therapy (CBT) - 60m</option>
                  <option value="Anxiety & Stress Management">Anxiety & Stress Management - 60m</option>
                  <option value="Couples & Relationship Counseling">Couples & Relationship Counseling - 75m</option>
                  <option value="Mindfulness & Emotional Wellness">Mindfulness & Emotional Wellness - 45m</option>
                  <option value="Quick Follow-up Session">Quick Follow-up Session - 30m</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newBooking.start_time}
                    onChange={(e) => setNewBooking({ ...newBooking, start_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fee (₹ INR)</label>
                  <input
                    type="number"
                    value={newBooking.price_inr}
                    onChange={(e) => setNewBooking({ ...newBooking, price_inr: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={newBooking.status}
                    onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment</label>
                  <select
                    value={newBooking.payment_status}
                    onChange={(e) => setNewBooking({ ...newBooking, payment_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  placeholder="Additional context or referral info..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submittingAction}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingAction}
                  className="bg-teal-800 hover:bg-teal-900 text-white"
                >
                  {submittingAction ? 'Saving to Supabase...' : 'Save to Database'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DATABASE CONFIG / DIAGNOSTICS MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-teal-800" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Supabase Connection Diagnostics</h3>
                  <p className="text-[11px] text-slate-500">Live configuration and table endpoints</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Active Supabase URL</div>
                <div className="text-slate-900 break-all select-all">{config.url}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Project ID</div>
                <div className="text-teal-900 font-bold">{config.projectId}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Supabase Anon Key</div>
                <div className="text-slate-700 break-all select-all">{config.key.slice(0, 20)}...{config.key.slice(-10)}</div>
              </div>

              <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-200/70 space-y-2 font-sans">
                <div className="text-teal-900 text-xs font-semibold">Connected Database Tables</div>
                <div className="space-y-1 text-slate-700 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Table <code>appointments</code>:</span>
                    <span className="text-emerald-700 font-bold">Active & Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Table <code>bookings</code>:</span>
                    <span className="text-emerald-700 font-bold">Active & Ready</span>
                  </div>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed pt-1 border-t border-teal-200/50">
                  Whenever an appointment is booked on the client portal or created in the admin panel, records are synchronized into both tables so they are immediately visible in your Supabase Table Editor.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 font-sans">
              <button
                onClick={checkConnection}
                className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-check Health</span>
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfigModal(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
