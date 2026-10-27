import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { schedulingApi, therapistApi } from '../../api/index.js';
import Calendar from '../../components/scheduling/Calendar.jsx';
import AvailabilityEditor from '../../components/scheduling/AvailabilityEditor.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Schedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'availability'
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [therapistProfile, setTherapistProfile] = useState(null);

  const loadData = async () => {
    try {
      const [sessData, profileData] = await Promise.all([
        schedulingApi.getSessions(user?.id || 'therapist_sharma'),
        therapistApi.getProfile(user?.id || 'therapist_sharma')
      ]);
      setSessions(sessData || []);
      setTherapistProfile(profileData);
    } catch (err) {
      showToast('Error loading schedule: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateStatus = async (sessionId, status) => {
    try {
      await schedulingApi.updateSessionStatus(sessionId, status);
      showToast(`Session marked as ${status}`, 'success');
      loadData();
    } catch (err) {
      showToast('Failed to update session: ' + err.message, 'error');
    }
  };

  const handleSaveAvailability = async ({ weekly, bufferMinutes }) => {
    try {
      await therapistApi.updateProfile(user?.id || 'therapist_sharma', {
        availability: { ...therapistProfile.availability, weekly },
        bufferMinutes
      });
      loadData();
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return <Loader text="Loading schedule and bookings..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Schedule & Calendar Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your consultation slots, mark session completions, and configure recurring practice availability.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'calendar'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('availability')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'availability'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Weekly Availability & Buffers</span>
          </button>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <Calendar
          sessions={sessions}
          onUpdateStatus={handleUpdateStatus}
          onWriteNote={(session) => {
            navigate(`/notes?session=${session.id}&client=${session.clientId}`);
          }}
        />
      ) : (
        <AvailabilityEditor
          initialAvailability={therapistProfile?.availability}
          bufferMinutes={therapistProfile?.bufferMinutes || 15}
          onSave={handleSaveAvailability}
        />
      )}
    </div>
  );
}
