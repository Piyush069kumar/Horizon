import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Code2, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: 'admin@horizon.demo',
      password: 'Password123!',
    },
  });

  const onSubmit = async (data: any) => {
    setErrorMsg(null);
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        toast.success('Welcome back to Horizon!');
        navigate('/dashboard');
      } else {
        const error = res.error?.message || 'Invalid credentials';
        setErrorMsg(error);
        toast.error(error);
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message;
      if (message) {
        setErrorMsg(message);
        toast.error(message);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        const networkError = 'Waking up server on Render free tier... Please wait 10 seconds and click Sign In again.';
        setErrorMsg(networkError);
        toast.error('Server connection error. Please retry.');
      } else {
        const fallback = 'Failed to authenticate. Check server connection.';
        setErrorMsg(fallback);
        toast.error(fallback);
      }
    }
  };

  const setDemoCredentials = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Light Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-2xl shadow-xl shadow-brand-500/30 mb-2">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Horizon Dashboard
          </h2>
          <p className="text-xs text-slate-400 font-normal">
            Client Project & Real-Time Task Management System
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-800 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="admin@horizon.demo"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Demo Credentials (Click to Select)
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@horizon.demo')}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/30 rounded-xl flex flex-col items-center gap-1 transition-all group text-center"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-purple-300 text-[11px]">Admin</span>
              <span className="text-[9px] text-slate-500 truncate w-full">admin@horizon.demo</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('pm1@horizon.demo')}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 rounded-xl flex flex-col items-center gap-1 transition-all group text-center"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-indigo-300 text-[11px]">PM 1</span>
              <span className="text-[9px] text-slate-500 truncate w-full">pm1@horizon.demo</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('dev1@horizon.demo')}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-teal-500/30 rounded-xl flex flex-col items-center gap-1 transition-all group text-center"
            >
              <Code2 className="w-4 h-4 text-teal-400" />
              <span className="font-semibold text-teal-300 text-[11px]">Dev 1</span>
              <span className="text-[9px] text-slate-500 truncate w-full">dev1@horizon.demo</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center">Development Password: <code className="text-slate-300">Password123!</code></p>
        </div>
      </div>
    </div>
  );
};
