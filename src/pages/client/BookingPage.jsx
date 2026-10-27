import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar as CalIcon, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { therapistApi, schedulingApi, paymentApi, clientApi } from '../../api/index.js';
import { getLocalTimezone, formatDualTime } from '../../utils/timezone.js';
import SlotPicker from '../../components/scheduling/SlotPicker.jsx';
import TimezoneSelect from '../../components/scheduling/TimezoneSelect.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import CheckoutForm from '../../components/payments/CheckoutForm.jsx';
import { notificationService } from '../../utils/notificationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(addDays(startOfToday(), 1), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientTz, setClientTz] = useState(getLocalTimezone());

  // Client info state (defaults to demo client Aarav Mehta)
  const [clientName, setClientName] = useState('Aarav Mehta');
  const [clientEmail, setClientEmail] = useState('client@demo.com');
  const [clientPhone, setClientPhone] = useState('+91 98765 43210');
  const [clientPackage, setClientPackage] = useState(null);

  // Booking Flow Steps: 1: Service & Slot, 2: Checkout & Payment, 3: Confirmed
  const [step, setStep] = useState(1);
  const [createdSession, setCreatedSession] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // 1. Load therapist
  useEffect(() => {
    let mounted = true;
    async function loadTherapist() {
      try {
        const t = await therapistApi.getBySlug(slug);
        if (mounted) {
          if (!t) {
            navigate('/404', { replace: true });
            return;
          }
          setTherapist(t);
          if (t.services && t.services.length > 0) {
            setSelectedService(t.services[0]);
          }
        }
      } catch (err) {
        navigate('/404', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadTherapist();
    return () => { mounted = false; };
  }, [slug, navigate]);

  // 2. Load open slots whenever therapist, date, or service duration changes
  useEffect(() => {
    let mounted = true;
    async function loadSlots() {
      if (!therapist || !selectedService || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const available = await schedulingApi.getAvailableSlots(
          therapist.id,
          selectedDate,
          selectedService.duration
        );
        if (mounted) {
          setSlots(available || []);
          setSelectedSlot(null);
          setBookingError('');
        }
      } finally {
        if (mounted) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => { mounted = false; };
  }, [therapist, selectedService, selectedDate]);

  // 3. Load active client packages if demo client
  useEffect(() => {
    paymentApi.getClientPackages('client_1').then(pkgs => {
      if (pkgs && pkgs.length > 0) {
        setClientPackage(pkgs[0]);
      }
    });
  }, []);

  const handleProceedToPayment = () => {
    if (!selectedSlot) {
      showToast('Please select a time slot first', 'error');
      return;
    }
    setStep(2);
  };

  const handleConfirmBooking = async (paymentDetails = null) => {
    setSubmittingBooking(true);
    setBookingError('');
    try {
      const sessionPayload = {
        therapistId: therapist.id,
        clientId: 'client_1',
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        duration: selectedService.duration,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        priceINR: selectedService.priceINR,
        paymentDetails
      };

      const session = await schedulingApi.bookSession(sessionPayload);

      // Verify that Supabase returned confirmation
      if (!session?.supabaseSync?.success) {
        throw new Error(session?.supabaseSync?.error || 'Database did not confirm appointment persistence.');
      }

      setCreatedSession(session);
      setStep(3);

      // Trigger multi-channel notifications
      notificationService.notify({
        title: 'New Consultation Confirmed',
        message: `${clientName} booked ${selectedService.name} on ${format(new Date(selectedSlot.start), 'dd MMM yyyy at h:mm a')}.`,
        type: 'booking',
        channel: 'whatsapp',
        recipient: `${clientPhone} & ${therapist.name}`
      });

      const tableName = session.supabaseSync.table || 'appointments & bookings';
      showToast(`Appointment confirmed and saved to Supabase (${tableName})!`, 'success', 'Saved to Supabase');
    } catch (err) {
      console.error('[Booking Error]', err);
      const errMsg = err.message || 'Double booking error or database failure. Slot could not be saved.';
      setBookingError(errMsg);
      showToast(errMsg, 'error', 'Booking Failed');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleWaitlistSubmitted = async (wlData) => {
    try {
      await schedulingApi.joinWaitlist({
        therapistId: therapist.id,
        date: selectedDate,
        clientName: wlData.name,
        clientEmail: wlData.email,
        clientPhone: wlData.phone,
        preferredTime: 'Any Open Slot'
      });
      showToast('Added to waitlist! You will receive a WhatsApp ping if a cancellation occurs.', 'success');
    } catch (err) {
      showToast('Waitlist error', 'error');
    }
  };

  if (loading) {
    return <Loader text="Loading therapist practice schedule..." />;
  }

  // Next 14 days for date picker
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(startOfToday(), i + 1);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dayNumber: format(d, 'd'),
      monthName: format(d, 'MMM')
    };
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* Top Breadcrumb & Therapist Lockup */}
      <div className="flex items-center justify-between">
        <Link
          to={`/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {therapist.name}'s Profile</span>
        </Link>
        <TimezoneSelect value={clientTz} onChange={setClientTz} />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
        <Avatar src={therapist.avatar} name={therapist.name} size="lg" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Book Session with {therapist.name}</h1>
          <p className="text-xs text-slate-500">{therapist.title} · {therapist.location}</p>
        </div>
      </div>

      {bookingError && (
        <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-2">
          <div className="flex items-start gap-2.5 font-bold text-rose-900">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span>Unable to Save Appointment to Database</span>
          </div>
          <p className="text-slate-600 pl-7 leading-relaxed font-mono text-[11px] bg-white/70 p-2.5 rounded-xl border border-rose-100">
            {bookingError}
          </p>
          <div className="pl-7 pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleConfirmBooking()}
              className="px-3 py-1.5 bg-rose-700 text-white font-semibold rounded-xl text-xs hover:bg-rose-800 transition-colors"
            >
              Retry Booking Sync
            </button>
            <Link
              to="/therapist/settings"
              className="text-xs text-rose-800 hover:text-rose-950 underline font-medium"
            >
              Check Supabase Settings &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1: Select Service, Date & Slot */}
      {step === 1 && (
        <div className="space-y-6">
          
          {/* Service Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Select Psychotherapy Consultation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(therapist.services || []).map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedService(srv)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{srv.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{srv.duration} mins</div>
                    </div>
                    <div className="mt-4 font-bold text-teal-900 font-mono text-sm tabular-nums">
                      {formatCurrency(srv.priceINR)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Select Appointment Date
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {upcomingDays.map((d) => {
                const isSelected = selectedDate === d.dateStr;
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`shrink-0 w-16 py-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase">{d.dayName}</div>
                    <div className="text-lg font-bold font-mono my-0.5">{d.dayNumber}</div>
                    <div className="text-[10px] text-slate-400">{d.monthName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot Picker Component */}
          {loadingSlots ? (
            <Loader text="Retrieving open calendar slots..." />
          ) : (
            <SlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              therapistTz={therapist.timezone || 'Asia/Kolkata'}
              clientTz={clientTz}
              selectedDate={selectedDate}
              onWaitlistSubmitted={handleWaitlistSubmitted}
            />
          )}

          {/* Client Details Summary */}
          {selectedSlot && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Your Booking Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (For Calendar Invite)</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone (For Reminders)</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleProceedToPayment}
                  className="text-xs font-bold"
                >
                  Proceed to Order Summary & Payment →
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Checkout Form & Razorpay */}
      {step === 2 && selectedService && selectedSlot && (
        <div className="space-y-4">
          <button
            type="button"
            disabled={submittingBooking}
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-800 disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change selected slot</span>
          </button>

          {submittingBooking && (
            <div className="bg-white rounded-3xl p-10 border border-teal-200 shadow-xs text-center space-y-4">
              <Loader text="Saving appointment record to Supabase database (appointments & bookings tables)..." />
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Verifying cloud database write & generating encrypted consultation link...
              </p>
            </div>
          )}

          {!submittingBooking && (
            <CheckoutForm
              itemTitle={selectedService.name}
              duration={selectedService.duration}
              subtotal={selectedService.priceINR}
              clientPackage={clientPackage}
              onPaymentComplete={handleConfirmBooking}
              onPackageRedeem={() => handleConfirmBooking({ method: 'package_credit' })}
            />
          )}
        </div>
      )}

      {/* STEP 3: Confirmed Screen */}
      {step === 3 && createdSession && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-teal-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Confirmed & Saved to Supabase
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Session is Confirmed!</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Appointment record has been successfully saved to your Supabase database. Google Meet link dispatched to <strong>{clientEmail}</strong>.
            </p>
          </div>

          <div className="max-w-md mx-auto p-5 bg-[#FAF8F5] rounded-2xl border border-slate-200/80 text-left text-xs space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Therapist:</span>
              <span className="font-bold text-slate-800">{therapist.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Consultation:</span>
              <span className="font-semibold text-slate-800">{createdSession.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Time:</span>
              <span className="font-bold text-teal-900 font-mono tabular-nums">
                {format(new Date(createdSession.startTime), 'EEEE, dd MMM yyyy · h:mm a')}
              </span>
            </div>
            {createdSession.meetLink && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Encrypted Video Link:</span>
                <a
                  href={createdSession.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-teal-700 underline truncate block"
                >
                  {createdSession.meetLink}
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Supabase Table Sync:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {createdSession.supabaseSync?.table || 'appointments & bookings'}
                </span>
              </div>
              {createdSession.supabaseSync?.recordId && (
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
                  <span>Record ID:</span>
                  <span className="font-bold text-slate-900 select-all">{createdSession.supabaseSync.recordId}</span>
                </div>
              )}
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Project: <strong className="text-slate-600 font-mono">jinlmpvhullytpjbcdcn</strong></span>
                <a
                  href="https://supabase.com/dashboard/project/jinlmpvhullytpjbcdcn/editor"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 hover:text-teal-900 font-semibold underline flex items-center gap-1"
                >
                  Open Table Editor &rarr;
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/portal">
              <Button variant="primary" size="md" className="text-xs font-semibold">
                Go to My Client Portal
              </Button>
            </Link>
            <Link to={`/${slug}`}>
              <Button variant="outline" size="md" className="text-xs font-semibold">
                Return to Therapist Page
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
