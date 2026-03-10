import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TPI System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Job Import Template');

    // Row 1: Main Title
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `ON-GOING JOBS AS AT ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}`;
    titleCell.font = { bold: true, color: { argb: 'FF111E4A' }, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Row 2 & 3: Multi-level Headers
    // Merged vertical headers
    ['A', 'B', 'C', 'D', 'E'].forEach(col => {
      worksheet.mergeCells(`${col}2:${col}3`);
      const cell = worksheet.getCell(`${col}2`);
      cell.font = { bold: true, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    worksheet.getCell('A2').value = 'Client Name';
    worksheet.getCell('B2').value = 'Job Title';
    worksheet.getCell('C2').value = 'Commencement Date';
    worksheet.getCell('D2').value = 'Expiration Date';
    worksheet.getCell('E2').value = 'Project Status';

    // Merged horizontal headers
    const groupHeaders = [
      { range: 'F2:G2', label: 'Cost of Project', color: 'FFD9EAD3' },
      { range: 'H2:I2', label: 'Advance Payment Method', color: 'FFFCE5CD' },
      { range: 'J2:K2', label: 'Balance Payment', color: 'FFF4CCCC' }
    ];

    groupHeaders.forEach(group => {
      worksheet.mergeCells(group.range);
      const cell = worksheet.getCell(group.range.split(':')[0]);
      cell.value = group.label;
      cell.font = { bold: true, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: group.color } };
      cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
      };
    });

    // Sub-headers (Row 3)
    const subHeaders = ['Naira (NGN)', 'Dollars (USD$)', 'Naira (NGN)', 'Dollars (USD$)', 'Naira (NGN)', 'Dollars (USD$)'];
    const subHeaderRow = worksheet.getRow(3);
    subHeaderRow.height = 25;
    
    for (let i = 0; i < subHeaders.length; i++) {
      const cell = subHeaderRow.getCell(6 + i); // Column F starts at index 6
      cell.value = subHeaders[i];
      cell.font = { bold: true, size: 9 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
      };
    }

    // Set Column Widths
    worksheet.getColumn(1).width = 25; // Client Name
    worksheet.getColumn(2).width = 45; // Job Title
    worksheet.getColumn(3).width = 20; // Commencement
    worksheet.getColumn(4).width = 20; // Expiration
    worksheet.getColumn(5).width = 25; // Status
    [6, 7, 8, 9, 10, 11].forEach(i => worksheet.getColumn(i).width = 18);

    // Add a Sample Group (Matching the image style)
    worksheet.addRow(['TOTAL ENERGIES', 'Compliance Monitoring of OBITE/IBEWA Gas Plant', 'February, 2022', '', 'Sampling and analysis ongoing', 9273706.50, 9273.70]);
    worksheet.addRow(['', 'Compliance Monitoring of Rumuji Platform', 'January, 2024', '', 'Sampling and analysis ongoing', 13790480.00, 0, 5860560.00]);
    worksheet.addRow(['RENAISSANCE', 'Provision of Call off services for TIER 1:Assessment', '', '', 'On going(Site visit pending)', 10000000.00, 0, 5000000.00]);
    worksheet.addRow(['Chevron', 'Chevron Escravos Onshore EES', 'November, 2025', '', 'Field report on going', 0, 832000.00, 0, 832000.00]);

    // Apply borders and alignment to a few rows
    for (let i = 4; i <= 7; i++) {
        const row = worksheet.getRow(i);
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { vertical: 'middle', wrapText: true };
        });
        // Currency formatting for financial columns
        [6, 7, 8, 9, 10, 11].forEach(colIndex => {
            row.getCell(colIndex).numFmt = '#,##0.00';
        });
    }

    // Freeze top 3 rows
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];

    // Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="tpi-bulk-import-template.xlsx"',
      },
    });
  } catch (error: unknown) {
    console.error('Template Generation Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
