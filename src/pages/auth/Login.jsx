import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { DEMO_CREDENTIALS } from '../../utils/constants.js';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Login() {
  const { login, switchAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: DEMO_CREDENTIALS.therapist.email,
      password: DEMO_CREDENTIALS.therapist.password
    }
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setAuthError('');
    try {
      const data = await login(values.email, values.password);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      const destination = location.state?.from?.pathname || (data.user.role === 'therapist' ? '/dashboard' : '/portal');
      navigate(destination, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = (role = 'therapist') => {
    if (role === 'therapist') {
      setValue('email', DEMO_CREDENTIALS.therapist.email);
      setValue('password', DEMO_CREDENTIALS.therapist.password);
      switchAccount('therapist');
      showToast('Switched to Demo Therapist (Dr. Neha Sharma)', 'info');
      navigate('/dashboard');
    } else {
      setValue('email', DEMO_CREDENTIALS.client.email);
      setValue('password', DEMO_CREDENTIALS.client.password);
      switchAccount('client');
      showToast('Switched to Demo Client (Aarav Mehta)', 'info');
      navigate('/portal');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-md space-y-6">
        
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block mb-2">
            <span className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
              U
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Sign in to Unfazed</h1>
          <p className="text-xs text-slate-500">Access your private practice management portal.</p>
        </div>

        {authError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Valid email format required' }
                })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-600 mt-0.5">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">Password</label>
              <span className="text-[11px] text-teal-800 hover:underline cursor-pointer">Forgot?</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>
            {errors.password && <p className="text-[11px] text-rose-600 mt-0.5">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full text-xs font-bold"
          >
            Sign In to Practice
          </Button>
        </form>

        {/* Demo Accounts Quick Login Strip */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/70 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
            One-Click Demo Credentials
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleUseDemo('therapist')}
              className="py-2 px-2.5 bg-white hover:bg-teal-50 text-teal-900 border border-teal-200 rounded-xl text-[11px] font-semibold text-center transition-colors shadow-xs"
            >
              👩‍⚕️ Dr. Sharma (Therapist)
            </button>
            <button
              type="button"
              onClick={() => handleUseDemo('client')}
              className="py-2 px-2.5 bg-white hover:bg-teal-50 text-teal-900 border border-teal-200 rounded-xl text-[11px] font-semibold text-center transition-colors shadow-xs"
            >
              👤 Aarav Mehta (Client)
            </button>
          </div>
          <div className="text-[10px] text-slate-400 text-center">
            Therapist: sharma@demo.com / Demo@1234
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          New mental health practitioner?{' '}
          <Link to="/register" className="font-bold text-teal-800 hover:underline">
            Register your practice
          </Link>
        </div>

      </div>
    </div>
  );
}
