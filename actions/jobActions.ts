'use server';

import connectToDatabase from '../lib/db';
import { JobRecord } from '../models/JobRecord';
import { Client } from '../models/Client';
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
  clientName?: string;
  searchQuery?: string;
  status?: string | string[];
  currency?: string;
  commencementStart?: string | Date;
  commencementEnd?: string | Date;
  expirationStart?: string | Date;
  expirationEnd?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
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
    
    if (filters.searchQuery) {
      query.$or = [
        { clientName: { $regex: filters.searchQuery, $options: 'i' } },
        { jobDescription: { $regex: filters.searchQuery, $options: 'i' } }
      ];
    } else if (filters.clientName) {
      query.clientName = { $regex: filters.clientName, $options: 'i' };
    }
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else if (filters.status.includes(',')) {
        query.status = { $in: filters.status.split(',') };
      } else {
        query.status = filters.status;
      }
    }
    
    if (filters.currency) {
      query.currency = filters.currency;
    }

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
      query.dueDate = dueDateQuery;
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
      query.dueDate = { ...(query.dueDate as object || {}), $gte: startOfMonth, $lte: endOfMonth };
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

export async function getJobById(id: string): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    const job = await JobRecord.findById(id).lean();
    
    if (!job) {
      return {
        success: false,
        error: 'Job record not found',
      };
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(job)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch job details';
    console.error('Error fetching job by ID:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateJob(id: string, data: Partial<JobRecordInput>): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    const updatedJob = await JobRecord.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return {
        success: false,
        error: 'Job record not found',
      };
    }

    revalidatePath('/jobs');
    revalidatePath(`/clients`); // Revalidate all client pages just in case
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedJob)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update job';
    console.error('Error updating job:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function bulkCreateJobs(jobs: JobRecordInput[]): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    // Validate each job (optional but recommended for robustness)
    const validatedJobs = jobs.map(job => {
      // Basic validation: ensure required fields are present
      if (!job.clientName || !job.jobDescription || !job.category || !job.agreedPrice || !job.currency || !job.startDate || !job.dueDate) {
        throw new Error(`Invalid job data: Missing required fields for job with client ${job.clientName || 'Unknown'}`);
      }
      return {
        ...job,
        status: job.status || 'Pending',
        amountPaid: job.amountPaid || 0,
        outstandingBalance: (job.agreedPrice || 0) - (job.amountPaid || 0),
      };
    });

    const result = await JobRecord.insertMany(validatedJobs);

    // Synchronize Client records
    const uniqueClientNames = [...new Set(validatedJobs.map(j => j.clientName))];
    
    // Using a loop to avoid large bulk operations if not needed, but efficient enough for typical imports
    for (const clientName of uniqueClientNames) {
      // Case-insensitive check and upsert
      await Client.findOneAndUpdate(
        { clientName: { $regex: new RegExp(`^${clientName}$`, 'i') } },
        { $setOnInsert: { clientName } },
        { upsert: true, new: true }
      );
    }

    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    revalidatePath('/clients');
    revalidatePath('/jobs/new');
    revalidatePath('/reports/export');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(result)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to bulk create jobs';
    console.error('Error bulk creating jobs:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
