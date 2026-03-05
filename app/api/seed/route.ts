import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Client } from '@/models/Client';
import { JobRecord } from '@/models/JobRecord';

const mockClients = [
  {
    clientName: 'Nexus Energy Corp',
    contactEmail: 'billing@nexusenergy.com',
    contactPhone: '+234 803 123 4567',
    industry: 'Oil & Gas',
  },
  {
    clientName: 'Pinnacle Technologies',
    contactEmail: 'finance@pinnacletech.io',
    contactPhone: '+234 812 987 6543',
    industry: 'Technology',
  },
  {
    clientName: 'Zenith Logistics Ltd',
    contactEmail: 'accounts@zenithlogistics.com',
    contactPhone: '+234 905 555 1234',
    industry: 'Transportation',
  },
  {
    clientName: 'Horizon Real Estate Group',
    contactEmail: 'hello@horizonrealestate.net',
    contactPhone: '+234 701 234 5678',
    industry: 'Real Estate',
  },
  {
    clientName: 'Apex Financial Services',
    contactEmail: 'inquiries@apexfinance.ng',
    contactPhone: '+234 809 111 2222',
    industry: 'Financial Consulting',
  },
];

const mockJobs = [
  // Nexus Energy Corp (NGN & USD mix)
  {
    clientName: 'Nexus Energy Corp',
    jobDescription: 'Annual Statutory Audit for FY2025',
    category: 'Audit & Assurance',
    agreedPrice: 4500000,
    amountPaid: 2000000,
    currency: 'NGN',
    startDate: new Date('2026-01-15'),
    dueDate: new Date('2026-04-30'),
    status: 'Ongoing',
    internalNotes: 'Pending final review of offshore assets.',
  },
  {
    clientName: 'Nexus Energy Corp',
    jobDescription: 'Expatriate Quota Renewal & Tax Advisory',
    category: 'Tax Advisory',
    agreedPrice: 15000,
    amountPaid: 15000,
    currency: 'USD',
    startDate: new Date('2025-11-01'),
    dueDate: new Date('2025-12-15'),
    status: 'Completed',
  },
  
  // Pinnacle Technologies (Focus heavily on NGN, varying statuses)
  {
    clientName: 'Pinnacle Technologies',
    jobDescription: 'Q1 Corporate Tax Filing',
    category: 'Tax Advisory',
    agreedPrice: 850000,
    amountPaid: 0,
    currency: 'NGN',
    startDate: new Date('2026-04-01'),
    dueDate: new Date('2026-04-15'),
    status: 'Pending',
  },
  {
    clientName: 'Pinnacle Technologies',
    jobDescription: 'Financial System Implementation Review',
    category: 'Financial Consulting',
    agreedPrice: 2200000,
    amountPaid: 1100000,
    currency: 'NGN',
    startDate: new Date('2025-10-10'),
    dueDate: new Date('2026-02-28'),
    status: 'Overdue',
    internalNotes: 'Client delayed providing system access credentials.',
  },
  
  // Zenith Logistics Ltd (Heavy balances)
  {
    clientName: 'Zenith Logistics Ltd',
    jobDescription: 'Monthly Payroll Processing & Transfer Pricing',
    category: 'Accountancy Services',
    agreedPrice: 12000000,
    amountPaid: 3000000,
    currency: 'NGN',
    startDate: new Date('2026-01-01'),
    dueDate: new Date('2026-12-31'),
    status: 'Ongoing',
  },

  // Horizon Real Estate Group (High volume, quick turnarounds)
  {
    clientName: 'Horizon Real Estate Group',
    jobDescription: 'Property Valuation Audit - Block A',
    category: 'Audit & Assurance',
    agreedPrice: 3000000,
    amountPaid: 3000000,
    currency: 'NGN',
    startDate: new Date('2026-02-01'),
    dueDate: new Date('2026-02-28'),
    status: 'Completed',
  },
  {
    clientName: 'Horizon Real Estate Group',
    jobDescription: 'Merger Due Diligence Advisory',
    category: 'Financial Consulting',
    agreedPrice: 50000,
    amountPaid: 10000,
    currency: 'USD',
    startDate: new Date('2026-03-01'),
    dueDate: new Date('2026-05-30'),
    status: 'Ongoing',
  },

  // Apex Financial Services (Smaller consistent jobs)
  {
    clientName: 'Apex Financial Services',
    jobDescription: 'VAT Compliance Review',
    category: 'Tax Advisory',
    agreedPrice: 400000,
    amountPaid: 400000,
    currency: 'NGN',
    startDate: new Date('2026-01-10'),
    dueDate: new Date('2026-01-20'),
    status: 'Completed',
  },
  {
    clientName: 'Apex Financial Services',
    jobDescription: 'Company Secretarial Services setup',
    category: 'Others',
    agreedPrice: 650000,
    amountPaid: 150000,
    currency: 'NGN',
    startDate: new Date('2026-03-05'),
    dueDate: new Date('2026-04-10'),
    status: 'Ongoing',
  }
];

export async function GET() {
  try {
    await connectToDatabase();

    const clientNames = mockClients.map(c => c.clientName);
    
    // Remove clients and jobs that matches our mock data
    await Client.deleteMany({ clientName: { $in: clientNames } });
    await JobRecord.deleteMany({ clientName: { $in: clientNames } });
    
    // Seed new mock clients
    for (const cData of mockClients) {
        await new Client(cData).save();
    }
    
    // Seed new mock jobs
    for (const jData of mockJobs) {
       await new JobRecord(jData).save();
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${mockClients.length} clients and ${mockJobs.length} job records.` 
    });
  } catch (error: unknown) {
    const errObj = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json({ success: false, error: errObj.message }, { status: 500 });
  }
}
