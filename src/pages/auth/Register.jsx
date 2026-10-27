import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, User, Globe, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../api/index.js';
import { generateSlug, isValidSlug } from '../../utils/generateSlug.js';
import { SPECIALIZATIONS_LIST, LANGUAGES_LIST } from '../../utils/constants.js';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Register() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [slug, setSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [slugError, setSlugError] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState(['Anxiety & Panic Disorders', 'Cognitive Behavioral Therapy (CBT)']);
  const [selectedLanguages, setSelectedLanguages] = useState(['English', 'Hindi']);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  const passwordVal = watch('password', '');

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-teal-600' };
  };

  const strength = getPasswordStrength(passwordVal);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setValue('name', newName);
    if (!slug) {
      const auto = generateSlug(newName);
      setSlug(auto);
      checkSlugAvailability(auto);
    }
  };

  const checkSlugAvailability = async (s) => {
    if (!isValidSlug(s)) {
      setSlugError('Invalid handle. Use 3+ lowercase characters, numbers or hyphens.');
      setSlugAvailable(false);
      return;
    }
    setSlugError('');
    try {
      const isFree = await authApi.checkSlug(s);
      setSlugAvailable(isFree);
      if (!isFree) setSlugError('This practice handle is already claimed.');
    } catch {
      // ignore
    }
  };

  const onSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    if (!slugAvailable || slugError) {
      setAuthError('Please choose a valid and available branded link.');
      return;
    }

    setLoading(true);
    setAuthError('');
    try {
      await registerAuth({
        name: values.name,
        email: values.email,
        password: values.password,
        slug,
        specializations: selectedSpecializations,
        languages: selectedLanguages
      });
      showToast('Practice account created successfully!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-md space-y-6">
        
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block mb-2">
            <span className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
              U
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create Therapist Account</h1>
          <p className="text-xs text-slate-500">Launch your independent private practice with your own branded link.</p>
        </div>

        {authError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name & Title *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Dr. Aarti Deshmukh"
                {...register('name', { required: 'Name is required' })}
                onChange={handleNameChange}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-600 mt-0.5">{errors.name.message}</p>}
          </div>

          {/* Auto-Generated Editable Slug with Live Check */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Branded Public Handle *</label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-[#FAF8F5] overflow-hidden focus-within:ring-2 focus-within:ring-teal-700">
              <span className="px-3 text-xs text-slate-400 font-mono select-none">
                unfazed.in/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setSlug(val);
                  checkSlugAvailability(val);
                }}
                className="flex-1 py-2 pr-3 bg-transparent text-xs font-mono font-bold text-slate-800 outline-none"
              />
            </div>
            {slugError ? (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{slugError}</span>
              </p>
            ) : slugAvailable && slug ? (
              <p className="text-[11px] text-teal-700 mt-1 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>unfazed.in/{slug} is available!</span>
              </p>
            ) : null}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Professional Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="aarti@therapy.in"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-600 mt-0.5">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password (8+ chars) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Must be at least 8 characters' }
                  })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>
              {errors.password && <p className="text-[11px] text-rose-600 mt-0.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register('confirmPassword', { required: 'Please confirm password' })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {passwordVal && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Password Strength</span>
                <span className="font-semibold">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
              </div>
            </div>
          )}

          {/* Specializations Chips */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Specializations</label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
              {SPECIALIZATIONS_LIST.slice(0, 8).map((spec) => {
                const isSelected = selectedSpecializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      setSelectedSpecializations(prev =>
                        isSelected ? prev.filter(s => s !== spec) : [...prev, spec]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                      isSelected ? 'bg-teal-700 text-white border-teal-800' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full text-xs font-bold pt-2.5"
          >
            Launch Private Practice
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-800 hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
