import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/apiClient';
import { User, CreateUserInput } from '../types';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge } from '../components/RoleBadge';
import { UserModal } from '../components/UserModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Users, Mail, Clock, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { subscribePresenceDetails } from '../services/socketService';

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const unsubscribe = subscribePresenceDetails((data) => {
      setOnlineUserIds(data.activeUserIds || []);
    });
    return unsubscribe;
  }, []);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get('/users');
      return res.data.data as User[];
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await apiClient.post('/users', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      toast.success('User created successfully');
    },
  });

  const handleCreateUser = async (data: CreateUserInput) => {
    await createUserMutation.mutateAsync(data);
  };

  if (isLoading) return <LoadingSkeleton count={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            <span>Team Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered system users, role assignments, and real-time online activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs shadow-sm">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {onlineUserIds.length} Online
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-medium">{users?.length || 0} Total Team</span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.map((u) => {
          const isOnline = onlineUserIds.includes(u.id);

          return (
            <div
              key={u.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                isOnline ? 'border-emerald-500/30 bg-emerald-950/5' : 'border-slate-800 hover:border-slate-700'
              } space-y-3`}
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                    {u.name.charAt(0)}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                      isOnline ? 'bg-emerald-400 ring-2 ring-emerald-500/30 animate-pulse' : 'bg-slate-600'
                    }`}
                    title={isOnline ? 'Online now' : 'Offline'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-100 truncate">{u.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{u.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <RoleBadge role={u.role} />
                {isOnline ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400" title={u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString() : undefined}>
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>
                      {u.lastSeenAt
                        ? `Active ${formatDistanceToNow(new Date(u.lastSeenAt), { addSuffix: true })}`
                        : 'Offline'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Creation Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};
