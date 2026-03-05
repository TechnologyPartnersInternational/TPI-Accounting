import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import connectToDatabase from '../../../lib/db';
import { JobRecord } from '../../../models/JobRecord';
import { getJobs, JobFilters } from '../../../actions/jobActions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids, filters }: { ids?: string[]; filters?: JobFilters } = body;

    let jobs: Record<string, any>[] = [];

    // Data Ingestion: Handle explicit IDs or filter parameters
    if (ids && Array.isArray(ids) && ids.length > 0) {
      await connectToDatabase();
      jobs = await JobRecord.find({ _id: { $in: ids } })
        .sort({ createdAt: -1 })
        .lean();
      jobs = JSON.parse(JSON.stringify(jobs));
    } else {
      const response = await getJobs(filters || {});
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch jobs for export');
      }
      jobs = (response.data as Record<string, unknown>[]) || [];
    }

    // Worksheet Formatting
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TPI System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Job Export');

    // TPI Branding: Merged row 1
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Technology Partners International (TPI) - Job Export';
    titleCell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 14,
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF111E4A' },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Define columns (A to I) width
    worksheet.getColumn(1).width = 25; // Client Name
    worksheet.getColumn(2).width = 35; // Job Description
    worksheet.getColumn(3).width = 15; // Category
    worksheet.getColumn(4).width = 20; // Agreed Price
    worksheet.getColumn(5).width = 20; // Amount Paid
    worksheet.getColumn(6).width = 20; // Outstanding Balance
    worksheet.getColumn(7).width = 15; // Currency
    worksheet.getColumn(8).width = 15; // Status
    worksheet.getColumn(9).width = 20; // Due Date

    // Headers (Row 2)
    const headerRow = worksheet.getRow(2);
    headerRow.values = [
      'Client Name',
      'Job Description',
      'Category',
      'Agreed Price',
      'Amount Paid',
      'Outstanding Balance',
      'Currency',
      'Status',
      'Due Date',
    ];
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    // Freeze top row (actually rows 1 and 2, so headers remain visible)
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 2 },
    ];

    // Variables for dynamic totals
    let totalAgreedNGN = 0;
    let totalPaidNGN = 0;
    let totalOutstandingNGN = 0;
    let countNGN = 0;

    let totalAgreedUSD = 0;
    let totalPaidUSD = 0;
    let totalOutstandingUSD = 0;
    let countUSD = 0;

    // Populate data
    jobs.forEach((job) => {
      worksheet.addRow([
        job.clientName,
        job.jobDescription,
        job.category,
        job.agreedPrice,
        job.amountPaid,
        job.outstandingBalance,
        job.currency,
        job.status,
        job.dueDate ? new Date(job.dueDate).toISOString().split('T')[0] : '',
      ]);

      if (job.currency === 'NGN') {
        totalAgreedNGN += job.agreedPrice || 0;
        totalPaidNGN += job.amountPaid || 0;
        totalOutstandingNGN += job.outstandingBalance || 0;
        countNGN++;
      } else if (job.currency === 'USD') {
        totalAgreedUSD += job.agreedPrice || 0;
        totalPaidUSD += job.amountPaid || 0;
        totalOutstandingUSD += job.outstandingBalance || 0;
        countUSD++;
      }
    });

    // Add an empty row for visual separation
    worksheet.addRow([]);

    // Number formatting for currency columns (D, E, F)
    const numFmt = '#,##0.00';
    worksheet.getColumn(4).numFmt = numFmt;
    worksheet.getColumn(5).numFmt = numFmt;
    worksheet.getColumn(6).numFmt = numFmt;

    // Dynamic Totals grouped by currency
    if (countNGN > 0) {
      const ngnRow = worksheet.addRow([
        'TOTALS (NGN)',
        '',
        '',
        totalAgreedNGN,
        totalPaidNGN,
        totalOutstandingNGN,
        'NGN',
        '',
        '',
      ]);
      ngnRow.font = { bold: true };
      ngnRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' },
      };
    }

    if (countUSD > 0) {
      const usdRow = worksheet.addRow([
        'TOTALS (USD)',
        '',
        '',
        totalAgreedUSD,
        totalPaidUSD,
        totalOutstandingUSD,
        'USD',
        '',
        '',
      ]);
      usdRow.font = { bold: true };
      usdRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' },
      };
    }

    // Generate Excel File
    const buffer = await workbook.xlsx.writeBuffer();

    // Return as downloadable file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="tpi-job-export.xlsx"',
      },
    });
  } catch (error: unknown) {
    console.error('Export Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate excel export' },
      { status: 500 }
    );
  }
}
