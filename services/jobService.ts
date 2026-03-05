// This file outlines the planned implementation for the frontend API client.

import { createJob, getJobs, getMonthlySummary, JobRecordInput, JobFilters } from '../actions/jobActions';
// Assume a toast library like react-hot-toast or sonner is used
// import { toast } from 'sonner';

/**
 * Frontend service wrapper for Next.js Server Actions.
 * Handles loading states and toast notifications implicitly when used in components
 * or explicitly abstracts error handling.
 */
export const jobService = {
  async createJob(data: JobRecordInput) {
    try {
      const result = await createJob(data);
      if (!result.success) {
        // toast.error(result.error || 'Failed to create job');
        throw new Error(result.error);
      }
      // toast.success('Job created successfully');
      return result.data;
    } catch (error: unknown) {
      console.error('Frontend JobService Error (create):', error);
      throw error;
    }
  },

  async getJobs(filters: JobFilters = {}) {
    try {
      const result = await getJobs(filters);
      if (!result.success) {
        // toast.error('Failed to load jobs');
        throw new Error(result.error);
      }
      return result.data;
    } catch (error: unknown) {
      console.error('Frontend JobService Error (fetch):', error);
      throw error;
    }
  },

  async getMonthlySummary(month: number, year: number) {
    try {
      const result = await getMonthlySummary(month, year);
      if (!result.success) {
         // toast.error('Failed to load monthly summary');
        throw new Error(result.error);
      }
      return result.data;
    } catch (error: unknown) {
      console.error('Frontend JobService Error (summary):', error);
      throw error;
    }
  },

  async exportJobsToExcel(ids?: string[], filters?: JobFilters) {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, filters }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tpi-job-export.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      // toast.success('Export successful');
    } catch (error) {
      console.error('Frontend JobService Error (export):', error);
      // toast.error('Failed to export jobs');
      throw error;
    }
  }
};
