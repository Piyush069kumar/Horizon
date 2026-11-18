import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Task, TaskStatus, PaginatedResponse } from '../types';
import { TaskCard } from '../components/TaskCard';
import { FilterBar } from '../components/FilterBar';
import { TaskModal } from '../components/TaskModal';
import { Pagination } from '../components/Pagination';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { CheckSquare, Plus } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Synchronize query parameters with TanStack Query key!
  const queryParams = searchParams.toString();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLimit = parseInt(searchParams.get('limit') || '10', 10);

  const { data: taskResponse, isLoading } = useQuery({
    queryKey: ['tasks', queryParams],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<Task>>(`/tasks?${queryParams}`);
      return res.data;
    },
  });

  const tasks = taskResponse?.data || [];
  const pagination = taskResponse?.pagination || {
    page: currentPage,
    limit: currentLimit,
    totalCount: 0,
    totalPages: 1,
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handlePageSizeChange = (newLimit: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', newLimit.toString());
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/tasks', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create task');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const res = await apiClient.patch(`/tasks/${taskId}/status`, { status });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Task moved to ${variables.status.replace('_', ' ')}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update status');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete task');
    },
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  const handleCreateTask = async (values: any) => {
    await createTaskMutation.mutateAsync(values);
  };

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  if (isLoading) return <LoadingSkeleton count={6} />;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-400" />
            <span>Tasks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'DEVELOPER'
              ? 'Tasks assigned specifically to you'
              : 'Overview of tasks across managed projects'}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        )}
      </div>

      {/* URL Filter Bar */}
      <FilterBar />

      {/* Tasks Grid */}
      {tasks && tasks.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={canCreate ? (id) => deleteTaskMutation.mutate(id) : undefined}
                canEdit={canCreate}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 25, 50]}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <EmptyState
          title="No Tasks Found"
          description="No tasks match the selected filters or search parameters."
          actionLabel={canCreate ? 'Create Task' : undefined}
          onAction={canCreate ? () => setIsTaskModalOpen(true) : undefined}
        />
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
