import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface ExportButtonProps {
  filename: string;
  apiUrl: string;
  params?: Record<string, string>;
  method?: 'GET' | 'POST';
}

export function ExportButton({
  filename,
  apiUrl,
  params = {},
  method = 'GET'
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('psg_admin_token');

      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${apiUrl}?${queryString}` : apiUrl;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Export CSV
    </Button>
  );
}

export default ExportButton;
