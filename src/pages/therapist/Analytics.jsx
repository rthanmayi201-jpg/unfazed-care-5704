import React, { useState, useEffect } from 'react';
import { IndianRupee, Users, Calendar, Clock, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { analyticsApi } from '../../api/index.js';
import StatCard from '../../components/analytics/StatCard.jsx';
import RevenueChart from '../../components/analytics/RevenueChart.jsx';
import NoShowChart from '../../components/analytics/NoShowChart.jsx';
import FeatureGate from '../../components/entitlement/FeatureGate.jsx';
import Loader from '../../components/common/Loader.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { FEATURE_KEYS } from '../../utils/constants.js';

export default function Analytics() {
  const { user } = useAuth();
  const [rangeDays, setRangeDays] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadAnalytics() {
      setLoading(true);
      try {
        const data = await analyticsApi.getAnalytics(user?.id || 'therapist_sharma', rangeDays);
        if (mounted) setAnalytics(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAnalytics();
    return () => { mounted = false; };
  }, [user, rangeDays]);

  if (loading && !analytics) {
    return <Loader text="Computing practice analytics..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Practice Intelligence & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregated metrics computed server-side for revenue growth, retention, and session attendance.
          </p>
        </div>

        {/* Date Range Segment */}
        <div className="flex items-center p-1 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs">
          {[
            { days: 30, label: 'Last 30 Days' },
            { days: 90, label: 'Last 90 Days' },
            { days: 365, label: 'Past 1 Year' }
          ].map(opt => (
            <button
              key={opt.days}
              type="button"
              onClick={() => setRangeDays(opt.days)}
              className={`px-3 py-1.5 font-semibold rounded-xl transition-colors ${
                rangeDays === opt.days
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`Total Revenue (${rangeDays}D)`}
          value={formatCurrency(analytics?.totalRevenue || 0)}
          change="+14.2%"
          isPositive={true}
          subtext="settled to bank"
          icon={IndianRupee}
        />
        <StatCard
          title="Active Clients"
          value={analytics?.activeClientsCount || 0}
          change="+3"
          isPositive={true}
          subtext="in therapy roster"
          icon={Users}
        />
        <StatCard
          title="Sessions Completed"
          value={analytics?.totalSessionsCount || 0}
          subtext="held & billed"
          icon={Calendar}
        />
        <StatCard
          title="No-Show Rate"
          value={`${analytics?.noShowRate || 0}%`}
          change="-1.8%"
          isPositive={true}
          subtext="cancellations: 5%"
          icon={Clock}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={analytics?.revenueTrend || []} />
        <NoShowChart data={analytics?.statusBreakdown || []} />
      </div>

      {/* Bottom Insights: Top Services & Advanced Package vs Single Split (Gated) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Services */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Top Consultations by Demand</h3>
            <p className="text-xs text-slate-500">Most frequently booked services by your practice clients.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {(analytics?.topServices || []).map((srv, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{srv.name}</span>
                <span className="text-slate-500 font-mono tabular-nums">{srv.count} sessions booked</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gated Advanced Analytics: Package vs Single Revenue Distribution */}
        <FeatureGate
          featureKey={FEATURE_KEYS.ADVANCED_ANALYTICS}
          featureName="Advanced Cohort & Package Revenue Analytics"
          showInlineLock={true}
        >
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Package vs. Single Session Breakdown</h3>
              <p className="text-xs text-slate-500">Deep financial cohort comparing recurring bundles vs ad-hoc appointments.</p>
            </div>

            <div className="space-y-4 pt-2">
              {(analytics?.packageVsSingleRevenue || []).map((item, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{item.type}</span>
                    <span className="font-mono tabular-nums">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${idx === 0 ? 'bg-teal-700' : 'bg-purple-600'}`}
                      style={{ width: `${idx === 0 ? '65%' : '35%'}` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FeatureGate>

      </div>
    </div>
  );
}
