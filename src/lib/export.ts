export function arrayToCSV(data, headers) {
  if (!data.length) return '';
  const headerRow = headers.join(',');
  const dataRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      const stringValue = String(value ?? '');
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateTimestamp() {
  const now = new Date();
  return now.toISOString().split('T')[0].replace(/-/g, '');
}
