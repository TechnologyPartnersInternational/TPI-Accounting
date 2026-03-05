'use server';

import connectToDatabase from '../lib/db';
import { Client } from '../models/Client';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface ClientInput {
  clientName: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
}

export async function createClient(data: ClientInput): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    // Check if client already exists (case-insensitive)
    const existingClient = await Client.findOne({ 
      clientName: { $regex: new RegExp(`^${data.clientName}$`, 'i') } 
    });
    
    if (existingClient) {
      return {
        success: false,
        error: 'A client with this exact name already exists. Please choose from the dropdown or use a different name.',
      };
    }
    
    const newClient = new Client(data);
    const savedClient = await newClient.save();

    revalidatePath('/jobs/new');
    revalidatePath('/clients');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(savedClient)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
    console.error('Error creating client:', errorMessage);
    
    if (errorMessage.includes('E11000 duplicate key error')) {
        return {
            success: false,
            error: 'A client with this exact name already exists.',
          };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while saving the client. Please try again.',
    };
  }
}

export async function getClients(searchTerm?: string): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    const query: Record<string, unknown> = {};
    if (searchTerm) {
      query.clientName = { $regex: searchTerm, $options: 'i' };
    }
    
    // Sort alphabetically by client names
    const clients = await Client.find(query).sort({ clientName: 1 }).lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(clients)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
    console.error('Error fetching clients:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export type ClientSummary = {
  _id: string;
  clientName: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
  ngnTotalValue: number;
  ngnTotalPaid: number;
  ngnTotalOutstanding: number;
  usdTotalValue: number;
  usdTotalPaid: number;
  usdTotalOutstanding: number;
  jobCount: number;
};

export async function getClientSummaries(searchTerm?: string): Promise<ActionResponse<ClientSummary[]>> {
  try {
    await connectToDatabase();

    const matchStage: Record<string, unknown> = {};
    if (searchTerm) {
      matchStage.clientName = { $regex: searchTerm, $options: 'i' };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'jobrecords', // Mongoose's default pluralized collection name for JobRecord
          localField: 'clientName',
          foreignField: 'clientName',
          as: 'jobs',
        },
      },
      {
        $project: {
          _id: 1,
          clientName: 1,
          contactEmail: 1,
          contactPhone: 1,
          industry: 1,
          jobCount: { $size: '$jobs' },
          ngnJobs: {
            $filter: {
              input: '$jobs',
              as: 'job',
              cond: { $eq: ['$$job.currency', 'NGN'] },
            },
          },
          usdJobs: {
            $filter: {
              input: '$jobs',
              as: 'job',
              cond: { $eq: ['$$job.currency', 'USD'] },
            },
          },
        },
      },
      {
        $addFields: {
          ngnTotalValue: { $sum: '$ngnJobs.agreedPrice' },
          ngnTotalPaid: { $sum: '$ngnJobs.amountPaid' },
          ngnTotalOutstanding: { $sum: '$ngnJobs.outstandingBalance' },
          usdTotalValue: { $sum: '$usdJobs.agreedPrice' },
          usdTotalPaid: { $sum: '$usdJobs.amountPaid' },
          usdTotalOutstanding: { $sum: '$usdJobs.outstandingBalance' },
        },
      },
      {
        $project: {
          ngnJobs: 0,
          usdJobs: 0,
        },
      },
      { $sort: { clientName: 1 } },
    ];

    // Disable linting strictly for this aggregation query execution variable type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clients = await Client.aggregate(pipeline as any[]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(clients)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch client summaries';
    console.error('Error fetching client summaries:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getClientById(id: string): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    const client = await Client.findById(id).lean();
    
    if (!client) {
      return {
        success: false,
        error: 'Client not found',
      };
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(client)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch client details';
    console.error('Error fetching client by ID:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
