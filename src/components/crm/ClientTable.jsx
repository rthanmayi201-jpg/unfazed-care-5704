import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, ChevronLeft, ChevronRight, ArrowUpDown, Tag, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';
import TagInput from './TagInput.jsx';
import UpgradePrompt from '../entitlement/UpgradePrompt.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useEntitlement } from '../../hooks/useEntitlement.js';
import { FEATURE_KEYS } from '../../utils/constants.js';

export default function ClientTable({
  clients = [],
  total = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedTag,
  onTagChange,
  onAddClient
}) {
  const { isWithinLimit, getLimit } = useEntitlement();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  // New Client Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTags, setNewTags] = useState(['Individual']);
  const [submitting, setSubmitting] = useState(false);

  // Client cap check
  const activeClientLimit = getLimit(FEATURE_KEYS.ACTIVE_CLIENT_CAP);
  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const canAddMoreClients = isWithinLimit(FEATURE_KEYS.ACTIVE_CLIENT_CAP, activeClientsCount);

  const handleOpenAddModal = () => {
    if (!canAddMoreClients) {
      setUpgradeModalOpen(true);
    } else {
      setAddModalOpen(true);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    setSubmitting(true);
    try {
      await onAddClient({
        name: newName,
        email: newEmail,
        phone: newPhone || '+91 98000 00000',
        tags: newTags,
        status: 'new'
      });
      setAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewTags(['Individual']);
    } finally {
      setSubmitting(false);
    }
  };

  // Sorting
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [clients, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Unique tags for filter chips
  const allTags = ['Anxiety', 'CBT', 'Work Burnout', 'Couples Counseling', 'Depression', 'Mindfulness'];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clients by name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-700 outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleOpenAddModal}
              className="text-xs"
            >
              Add New Client
            </Button>
          </div>
        </div>

        {/* Status segmented tabs and Tag filter chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {['all', 'active', 'new', 'inactive'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusChange(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  selectedStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Filter by:
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(selectedTag === tag ? '' : tag)}
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md border transition-colors ${
                  selectedTag === tag
                    ? 'bg-teal-700 text-white border-teal-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTag && (
              <button
                onClick={() => onTagChange('')}
                className="text-[11px] text-teal-800 hover:underline font-semibold ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Data View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-slate-200/80 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Client Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('lastSession')}>
                <div className="flex items-center gap-1">
                  <span>Last Session</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('nextSession')}>
                <div className="flex items-center gap-1">
                  <span>Next Session</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Clinical Tags</th>
              <th className="py-3 px-4 text-right cursor-pointer select-none" onClick={() => toggleSort('totalPaid')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Total Paid</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No clients match the current search or filters.
                </td>
              </tr>
            ) : (
              sortedClients.map((client) => (
                <tr key={client.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={client.name} size="sm" />
                      <div>
                        <Link to={`/clients/${client.id}`} className="font-semibold text-slate-900 hover:text-teal-800">
                          {client.name}
                        </Link>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{client.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant={client.status === 'active' ? 'confirmed' : client.status === 'new' ? 'pending' : 'cancelled'}>
                      {client.status.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px] tabular-nums">
                    {client.lastSession ? format(new Date(client.lastSession), 'dd MMM yyyy') : '—'}
                  </td>

                  <td className="py-3 px-4 text-slate-800 font-medium font-mono text-[11px] tabular-nums">
                    {client.nextSession ? (
                      <span className="text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                        {format(new Date(client.nextSession), 'dd MMM, h:mm a')}
                      </span>
                    ) : (
                      <span className="text-slate-400">Not scheduled</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(client.tags || []).map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono tabular-nums">
                    {formatCurrency(client.totalPaid)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/clients/${client.id}`}
                      className="text-xs font-semibold text-teal-800 hover:text-teal-900 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <strong>{clients.length}</strong> of <strong>{total}</strong> practice records
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="text-xs py-1 px-2.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </Button>
          <span className="font-semibold text-slate-700">
            Page {page} of {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="text-xs py-1 px-2.5"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Client Record"
        subtitle="Create an internal client record, assign clinical tags, and dispatch intake invitations."
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Maya Saxena"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="maya@example.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Phone Number</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Tags</label>
            <TagInput tags={newTags} onChange={setNewTags} />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Create Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* Active Client Cap Upgrade Prompt */}
      <UpgradePrompt
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        featureName="Active Client Limit"
        featureKey={FEATURE_KEYS.ACTIVE_CLIENT_CAP}
      />
    </div>
  );
}
