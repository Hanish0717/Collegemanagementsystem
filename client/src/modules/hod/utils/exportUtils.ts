/**
 * Utility functions for exporting HOD module data to CSV, Excel, PDF, and text files in browser.
 */

/**
 * Triggers an automatic browser file download for a Blob or string content.
 */
export function downloadFile(filename: string, content: string | Blob, mimeType = 'text/csv;charset=utf-8;') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts an array of objects into standard CSV format and downloads the file.
 */
export function exportToCSV(filename: string, data: Record<string, any>[], customHeaders?: string[]) {
  if (!data || data.length === 0) {
    // Generate sample row if empty
    data = [{ Status: 'No records available', Timestamp: new Date().toISOString() }];
  }

  const keys = customHeaders || Object.keys(data[0]);
  const headerRow = keys.map(k => `"${String(k).replace(/"/g, '""')}"`).join(',');

  const rows = data.map(row => {
    return keys.map(key => {
      let val = row[key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n'); // Add UTF-8 BOM for Excel compatibility
  downloadFile(filename.endsWith('.csv') ? filename : `${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Exports data formatted for Microsoft Excel (.xlsx / .csv).
 */
export function exportToExcel(filename: string, data: Record<string, any>[], sheetName = 'HOD Export') {
  const finalFileName = filename.endsWith('.csv') || filename.endsWith('.xlsx') ? filename : `${filename}.csv`;
  exportToCSV(finalFileName, data);
}

/**
 * Generates a clean text/document file download for transcripts, citations, and tickets.
 */
export function exportToTextDoc(filename: string, title: string, details: Record<string, any>) {
  const lines: string[] = [];
  lines.push('================================================================');
  lines.push(`               ${title.toUpperCase()}`);
  lines.push('================================================================');
  lines.push(`Generated On: ${new Date().toLocaleString()}`);
  lines.push('----------------------------------------------------------------');

  Object.entries(details).forEach(([key, val]) => {
    lines.push(`${key.padEnd(25)}: ${val}`);
  });

  lines.push('================================================================');
  lines.push('Confidential - Departmental ERP Office Record');
  lines.push('================================================================');

  downloadFile(filename, lines.join('\n'), 'text/plain;charset=utf-8;');
}
