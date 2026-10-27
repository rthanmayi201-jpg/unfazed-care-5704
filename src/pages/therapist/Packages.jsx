import React, { useState, useEffect } from 'react';
import { Package as PkgIcon, Plus, Sparkles, Check, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { paymentApi } from '../../api/index.js';
import PackageCard from '../../components/payments/PackageCard.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Loader from '../../components/common/Loader.jsx';
import FeatureGate from '../../components/entitlement/FeatureGate.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { FEATURE_KEYS } from '../../utils/constants.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Packages() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sessionsCount, setSessionsCount] = useState(6);
  const [perSessionRate, setPerSessionRate] = useState(2500);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [validityDays, setValidityDays] = useState(120);
  const [submitting, setSubmitting] = useState(false);

  const loadPackages = async () => {
    try {
      const data = await paymentApi.getPackages(user?.id || 'therapist_sharma');
      setPackages(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [user]);

  const computedTotal = Math.round((sessionsCount * perSessionRate) * (1 - discountPercent / 100));

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await paymentApi.savePackage({
        therapistId: user?.id || 'therapist_sharma',
        title: title.trim(),
        description: description.trim(),
        sessionsCount: Number(sessionsCount),
        perSessionRate: Number(perSessionRate),
        discountPercent: Number(discountPercent),
        totalPriceINR: computedTotal,
        validityDays: Number(validityDays),
        active: true
      });
      showToast('New therapy package bundle created!', 'success');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      loadPackages();
    } catch (err) {
      showToast('Failed to create package: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading session packages..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Session Package Bundles</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Offer 3, 6, or 12-session discounted treatment arcs to boost client retention and upfront practice cash flow.
          </p>
        </div>

        <FeatureGate
          featureKey={FEATURE_KEYS.PACKAGES_BUILDER}
          featureName="Package Builder"
        >
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold"
          >
            Create New Package
          </Button>
        </FeatureGate>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onBuy={() => showToast('Package link is live on your public practice page!', 'info')}
          />
        ))}
      </div>

      {/* Create Package Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Therapy Package Bundle"
        subtitle="Configure session volume discounts, per-session pricing, and validity periods."
      >
        <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bundle Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 6-Session Deep CBT Journey"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Short Clinical Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Recommended for long-term anxiety management, exposure work, and relapse prevention..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Number of Sessions</label>
              <select
                value={sessionsCount}
                onChange={(e) => setSessionsCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-700"
              >
                <option value={3}>3 Sessions</option>
                <option value={6}>6 Sessions</option>
                <option value={8}>8 Sessions</option>
                <option value={10}>10 Sessions</option>
                <option value={12}>12 Sessions</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Per-Session Rate (INR)</label>
              <input
                type="number"
                value={perSessionRate}
                onChange={(e) => setPerSessionRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bundle Discount (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Validity (Days)</label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200/70 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Standard Price:</span>
              <span className="line-through">{formatCurrency(sessionsCount * perSessionRate)}</span>
            </div>
            <div className="flex justify-between font-bold text-teal-900 text-sm">
              <span>Discounted Bundle Price:</span>
              <span className="font-mono">{formatCurrency(computedTotal)}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Publish Package
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
