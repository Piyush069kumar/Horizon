import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { Role, CreateUserInput } from '../types';
import { Eye, EyeOff, Loader2, AlertCircle, UserPlus, Shield, UserCheck, Code2 } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserInput) => Promise<void>;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserInput>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'DEVELOPER' as Role,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        email: '',
        password: '',
        role: 'DEVELOPER' as Role,
      });
      setServerError(null);
      setShowPassword(false);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (values: CreateUserInput) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to create user. Please check the provided information.';
      setServerError(msg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 font-medium">{serverError}</div>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            {...register('name', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
            type="text"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            placeholder="e.g. Sarah Connor"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Email Address <span className="text-rose-400">*</span>
          </label>
          <input
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address format',
              },
            })}
            type="email"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            placeholder="e.g. sarah@horizon.demo"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password with Visibility Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="Minimum 6 characters"
              disabled={isSubmitting}
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
          {errors.password && (
            <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* System Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Role Assignment <span className="text-rose-400">*</span>
          </label>
          <select
            {...register('role', { required: 'Please select a system role' })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all cursor-pointer font-medium"
            disabled={isSubmitting}
          >
            <option value="DEVELOPER">Developer (Assigned tasks, updates kanban & reviews)</option>
            <option value="PROJECT_MANAGER">Project Manager (Owns projects, schedules & tasks)</option>
            <option value="ADMIN">Administrator (Full platform, team & workspace governance)</option>
          </select>
          {errors.role && (
            <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.role.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating User...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
