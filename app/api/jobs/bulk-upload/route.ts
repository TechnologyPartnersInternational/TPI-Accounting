import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { bulkCreateJobs, JobRecordInput } from '@/actions/jobActions';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { success: false, error: 'Invalid excel file' },
        { status: 400 }
      );
    }

    const jobs: JobRecordInput[] = [];
    let lastClientName = '';
    
    // Skip header rows (Row 1: Title, Row 2: Main Headers, Row 3: Currencies)
    // Data starts on Row 4
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 3) return;

      const rowValues = row.values as (string | number | { result?: string | number } | undefined | null)[];
      
      const getVal = (v: string | number | { result?: string | number } | undefined | null): string => {
        if (!v) return '';
        if (typeof v === 'object' && v !== null && 'result' in v) return v.result?.toString() || '';
        return v.toString();
      };
      
      let clientName = getVal(rowValues[1]);
      if (clientName) {
         lastClientName = clientName;
      } else {
         clientName = lastClientName;
      }

      const jobTitle = getVal(rowValues[2]);
      if (!jobTitle) return;

      // Determine Currency and Prices
      let currency: 'NGN' | 'USD' = 'NGN';
      let agreedPrice = 0;
      let amountPaid = 0;

      const costNGN = parseFloat(getVal(rowValues[6]) || '0');
      const costUSD = parseFloat(getVal(rowValues[7]) || '0');
      const paidNGN = parseFloat(getVal(rowValues[8]) || '0');
      const paidUSD = parseFloat(getVal(rowValues[9]) || '0');

      if (costUSD > 0 || paidUSD > 0) {
        currency = 'USD';
        agreedPrice = costUSD;
        amountPaid = paidUSD;
      } else {
        currency = 'NGN';
        agreedPrice = costNGN;
        amountPaid = paidNGN;
      }

      // Robust Date Parsing
      const parseCustomDate = (dateStr: string | number | Date | { result?: string | number } | undefined | null): Date => {
        if (!dateStr) return new Date();
        if (dateStr instanceof Date) return dateStr;
        
        const str = getVal(dateStr).toLowerCase();
        
        // Handle "Oct.25" or "Oct'25"
        if (str.includes('.') || str.includes("'")) {
            const parts = str.split(/[.'\s]+/);
            if (parts.length >= 2) {
                const monthName = parts[0];
                const year = parseInt(parts[1]) < 100 ? 2000 + parseInt(parts[1]) : parseInt(parts[1]);
                return new Date(`${monthName} 1, ${year}`);
            }
        }

        // Handle "Quarter X, Year"
        if (str.includes('quarter')) {
            const match = str.match(/quarter\s*(\d)\W+(\d{4})/i);
            if (match) {
                const q = parseInt(match[1]);
                const year = parseInt(match[2]);
                const month = (q - 1) * 3;
                return new Date(year, month, 1);
            }
        }

        // Default native parse
        const parsed = new Date(str);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
      };

      const mapStatus = (statusStr: string): JobRecordInput['status'] => {
        const s = statusStr.toLowerCase();
        if (s.includes('ongoing') || s.includes('active') || s.includes('sampling') || s.includes('working')) return 'Ongoing';
        if (s.includes('completed') || s.includes('finished') || s.includes('done')) return 'Completed';
        if (s.includes('commence') || s.includes('pending') || s.includes('received') || s.includes('start')) return 'Pending';
        if (s.includes('overdue') || s.includes('late')) return 'Overdue';
        return 'Ongoing'; // Default for bulk import
      };

      const job: JobRecordInput = {
        clientName: clientName,
        jobDescription: jobTitle,
        category: 'Services', // Default or could be derived from title
        agreedPrice: agreedPrice,
        amountPaid: amountPaid,
        currency: currency,
        status: mapStatus(getVal(rowValues[5])),
        startDate: parseCustomDate(rowValues[3]),
        dueDate: parseCustomDate(rowValues[4] || rowValues[3]), // Fallback to start if no end
      };

      if (job.clientName && job.jobDescription && job.agreedPrice > 0) {
        jobs.push(job);
      }
    });

    if (jobs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid job data found in the file' },
        { status: 400 }
      );
    }

    const result = await bulkCreateJobs(jobs);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${jobs.length} jobs`,
      data: result.data
    });

  } catch (error: unknown) {
    console.error('Bulk Upload Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process bulk upload';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
