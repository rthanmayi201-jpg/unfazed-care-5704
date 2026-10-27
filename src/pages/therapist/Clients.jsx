import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { clientApi } from '../../api/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import ClientTable from '../../components/crm/ClientTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Clients() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [tag, setTag] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientApi.getClients(user?.id || 'therapist_sharma', {
        search: debouncedSearch,
        status,
        tag,
        page,
        limit: 10
      });
      setClients(data.clients || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      showToast('Failed to load client roster: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, debouncedSearch, status, tag, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddClient = async (clientData) => {
    try {
      const created = await clientApi.addClient({
        ...clientData,
        therapistId: user?.id || 'therapist_sharma'
      });
      showToast(`Client ${created.name} added to practice roster!`, 'success');
      fetchClients();
    } catch (err) {
      showToast('Failed to add client: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Client Directory & CRM</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain clinical client records, intake submissions, informed consent, and billing ledgers.
          </p>
        </div>
      </div>

      {loading && !clients.length ? (
        <Loader text="Loading client roster..." />
      ) : (
        <ClientTable
          clients={clients}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          searchQuery={search}
          onSearchChange={(q) => { setSearch(q); setPage(1); }}
          selectedStatus={status}
          onStatusChange={(st) => { setStatus(st); setPage(1); }}
          selectedTag={tag}
          onTagChange={(t) => { setTag(t); setPage(1); }}
          onAddClient={handleAddClient}
        />
      )}
    </div>
  );
}
