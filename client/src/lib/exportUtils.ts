/**
 * Universal Enterprise ERP Export & Print Utilities
 */

export interface ExportColumn {
  header: string;
  key: string;
}

/**
 * Trigger CSV / Excel file download in browser
 */
export function exportToCSV(filename: string, columns: ExportColumn[], data: any[]) {
  const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row => 
    columns.map(c => {
      const val = row[c.key] !== undefined && row[c.key] !== null ? String(row[c.key]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens clean formatted print view window with institutional header & signature block
 */
export function printReport(title: string, subtitle: string, columns: ExportColumn[], data: any[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tableHeaders = columns.map(c => `<th style="padding: 10px; border: 1px solid #cbd5e1; background: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase;">${c.header}</th>`).join('');
  const tableRows = data.map((row, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; font-size: 12px;">
      ${columns.map(c => `<td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${row[c.key] ?? ''}</td>`).join('')}
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} — ERP Official Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #0f172a; }
          .header { text-align: center; border-bottom: 3px double #1d4ed8; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 22px; font-weight: 900; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 600; }
          .meta { display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 15px; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; font-weight: 700; }
          .sig-box { text-align: center; border-top: 1px solid #94a3b8; padding-top: 6px; width: 180px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">COLLEGE ERP INSTITUTIONAL REPORT</div>
          <div class="subtitle">${title} — ${subtitle}</div>
        </div>
        <div class="meta">
          <span>Generated On: ${new Date().toLocaleString()}</span>
          <span>System Ref: ERP-DOC-${Math.floor(100000 + Math.random() * 900000)}</span>
          <span>Confidential — Official Record</span>
        </div>
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="signatures">
          <div class="sig-box">Prepared By</div>
          <div class="sig-box">Verified By HOD / Dean</div>
          <div class="sig-box">Authorized Signature</div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
