import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { ActivityLog, PaginatedResponse } from '../types';
import { ActivityFeedItem } from '../components/ActivityFeedItem';
import { Pagination } from '../components/Pagination';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Activity, RefreshCw } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLimit = parseInt(searchParams.get('limit') || '20', 10);

  const { data: activityResponse, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['activity', 'recent', currentPage, currentLimit],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<ActivityLog>>(
        `/activity/recent?page=${currentPage}&limit=${currentLimit}`
      );
      return res.data;
    },
  });

  const activityList = activityResponse?.data || [];
  const pagination = activityResponse?.pagination || {
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

  if (isLoading) return <LoadingSkeleton count={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" />
            <span>Activity Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical activity log audit trail fetched from PostgreSQL
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-300 font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        {activityList && activityList.length > 0 ? (
          activityList.map((item) => <ActivityFeedItem key={item.id} activity={item} />)
        ) : (
          <p className="text-xs text-slate-500 text-center py-10">No recent activity recorded.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {activityList && activityList.length > 0 && pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 50]}
          isLoading={isLoading || isRefetching}
        />
      )}
    </div>
  );
};
