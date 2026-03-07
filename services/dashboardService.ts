import connectToDatabase from '@/lib/db';
import { JobRecord } from '@/models/JobRecord';

export interface DashboardMetrics {
  totalValue: number;
  totalPaid: number;
  totalOutstanding: number;
  jobCount: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await connectToDatabase();

  const aggregationResult = await JobRecord.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$agreedPrice' },
        totalPaid: { $sum: '$amountPaid' },
        jobCount: { $sum: 1 },
      },
    },
  ]);

  if (aggregationResult.length > 0) {
    const data = aggregationResult[0];
    return {
      totalValue: data.totalValue || 0,
      totalPaid: data.totalPaid || 0,
      totalOutstanding: (data.totalValue || 0) - (data.totalPaid || 0),
      jobCount: data.jobCount || 0,
    };
  }

  return { totalValue: 0, totalPaid: 0, totalOutstanding: 0, jobCount: 0 };
}

export async function getRecentJobs(limit = 10) {
  await connectToDatabase();
  
  const jobs = await JobRecord.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    
  return JSON.parse(JSON.stringify(jobs));
}

export async function getUpcomingDeadlines(limit = 3) {
  await connectToDatabase();
  const jobs = await JobRecord.find({
    status: { $regex: /^(Started|Pending|Ongoing|Yet to commence)$/i },
    dueDate: { $gte: new Date() }
  })
    .sort({ dueDate: 1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(jobs));
}

export async function getSystemActivity(limit = 3) {
  await connectToDatabase();
  const jobs = await JobRecord.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(jobs));
}
