'use server';

import connectToDatabase from '../lib/db';
import { JobRecord } from '../models/JobRecord';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface JobRecordInput {
  clientName: string;
  jobDescription: string;
  category: string;
  agreedPrice: number;
  amountPaid?: number;
  currency: 'NGN' | 'USD';
  dueDate: Date | string;
  startDate: Date | string;
  completionDate?: Date | string;
  internalNotes?: string;
  status?: 'Ongoing' | 'Completed' | 'Pending' | 'Overdue';
}

export interface JobFilters {
  clientName?: string | string[];  // Support filtering by multiple clients
  searchQuery?: string;
  status?: string | string[];
  category?: string | string[];    // New: Category filtering
  currency?: string;
  commencementStart?: string | Date;
  commencementEnd?: string | Date;
  expirationStart?: string | Date;
  expirationEnd?: string | Date;
  startDate?: string | Date;  // Keep for backwards compatibility
  endDate?: string | Date;    // Keep for backwards compatibility
  month?: number;
  year?: number;
}

export async function createJob(data: JobRecordInput): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    const newJob = new JobRecord(data);
    const savedJob = await newJob.save();

    revalidatePath('/jobs');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(savedJob)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create job';
    console.error('Error creating job:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getJobs(filters: JobFilters = {}): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    const query: Record<string, unknown> = {};
    
    // Keyword Text search (Title or Description)
    if (filters.searchQuery) {
      query.$or = [
        { clientName: { $regex: filters.searchQuery, $options: 'i' } },
        { jobDescription: { $regex: filters.searchQuery, $options: 'i' } }
      ];
    } 
    
    // Client Name Exact or Array
    if (filters.clientName) {
      if (Array.isArray(filters.clientName)) {
        query.clientName = { $in: filters.clientName };
      } else {
        query.clientName = { $regex: filters.clientName, $options: 'i' };
      }
    }
    
    // Status Array Filtering
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else if (typeof filters.status === 'string' && filters.status.includes(',')) {
        query.status = { $in: filters.status.split(',') };
      } else {
        query.status = filters.status;
      }
    }

    // Category Array Filtering
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        query.category = { $in: filters.category };
      } else if (typeof filters.category === 'string' && filters.category.includes(',')) {
        query.category = { $in: filters.category.split(',') };
      } else {
        query.category = filters.category;
      }
    }
    
    if (filters.currency && filters.currency !== 'BOTH') {
      query.currency = filters.currency;
    }

    // Advanced Range Filtering for Dates
    if (filters.commencementStart || filters.commencementEnd) {
      const startDateQuery: Record<string, Date> = {};
      if (filters.commencementStart) startDateQuery.$gte = new Date(filters.commencementStart);
      if (filters.commencementEnd) startDateQuery.$lte = new Date(filters.commencementEnd);
      query.startDate = startDateQuery;
    }

    if (filters.expirationStart || filters.expirationEnd) {
      const dueDateQuery: Record<string, Date> = {};
      if (filters.expirationStart) dueDateQuery.$gte = new Date(filters.expirationStart);
      if (filters.expirationEnd) dueDateQuery.$lte = new Date(filters.expirationEnd);
      // Ensure we don't overwrite if backward compatibility blocks are also active
      query.dueDate = { ...(query.dueDate as Record<string, Date>), ...dueDateQuery };
    }
    
    // Backwards compatibility for dashboard month queries
    if (filters.startDate || filters.endDate) {
      const dueDateQuery: Record<string, Date> = (query.dueDate as Record<string, Date>) || {};
      if (filters.startDate) dueDateQuery.$gte = new Date(filters.startDate);
      if (filters.endDate) dueDateQuery.$lte = new Date(filters.endDate);
      query.dueDate = dueDateQuery;
    }
    
    if (filters.month && filters.year) {
      const startOfMonth = new Date(filters.year, filters.month - 1, 1);
      const endOfMonth = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
      
      // An active job for the month: startDate <= endOfMonth AND dueDate >= startOfMonth
      query.startDate = { $lte: endOfMonth };
      query.dueDate = { $gte: startOfMonth };
    }
    
    const jobs = await JobRecord.find(query).sort({ createdAt: -1 });
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(jobs)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch jobs';
    console.error('Error fetching jobs:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getMonthlySummary(month: number, year: number): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    
    const aggregationResult = await JobRecord.aggregate([
      {
        $match: {
          dueDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: '$currency',
          totalValue: { $sum: '$agreedPrice' },
          totalPaid: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$outstandingBalance' },
          count: { $sum: 1 },
        },
      },
    ]);
    
    const summaryByCurrency = aggregationResult.reduce((acc, curr) => {
      acc[curr._id] = {
        totalValue: curr.totalValue,
        totalPaid: curr.totalPaid,
        totalOutstanding: curr.totalOutstanding,
        jobCount: curr.count,
      };
      return acc;
    }, {} as Record<string, { totalValue: number; totalPaid: number; totalOutstanding: number; jobCount: number }>);

    return {
      success: true,
      data: summaryByCurrency,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
    console.error('Error generating monthly summary:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
