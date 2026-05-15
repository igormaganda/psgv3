import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, Trash2, Download, Eye, Calendar, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { FileUpload } from '../ui/FileUpload';
import { useToast } from '../ui/useToast';
import { ExportButton } from '../ui/ExportButton';

interface Document {
  id: string;
  title: string;
  description?: string;
  category: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'policy',
    file: null as File | null
  });
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('psg_admin_token');

      const response = await fetch('/api/admin/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      toast.error('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.file) {
      toast.error('Error', 'Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('psg_admin_token');

      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('category', uploadForm.category);
      if (uploadForm.description) formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);

      const response = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload document');
      }

      toast.success('Success', 'Document uploaded successfully');
      setShowUploadDialog(false);
      resetUploadForm();
      fetchDocuments();
    } catch (error) {
      toast.error('Error', error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      const token = localStorage.getItem('psg_admin_token');

      const response = await fetch(`/api/admin/documents?id=${selectedDocument.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      toast.success('Success', 'Document deleted successfully');
      setShowDeleteDialog(false);
      setSelectedDocument(null);
      fetchDocuments();
    } catch (error) {
      toast.error('Error', error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      category: 'policy',
      file: null
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      policy: 'admin',
      handbook: 'info',
      form: 'success',
      contract: 'warning',
      other: 'default'
    };
    return colors[category] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Document Management</h2>
          <p className="text-slate-600">Upload and manage company documents</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            filename={`documents-${new Date().toISOString().split('T')[0]}.csv`}
            apiUrl="/api/admin/export"
            params={{ type: 'documents' }}
          />
          <Button
            onClick={() => {
              resetUploadForm();
              setShowUploadDialog(true);
            }}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm mt-1">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <h3 className="font-medium text-slate-900 truncate">{doc.title}</h3>
                  </div>
                  <Badge variant={getCategoryColor(doc.category) as any}>
                    {doc.category}
                  </Badge>
                </div>

                {doc.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{doc.description}</p>
                )}

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{doc.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatFileSize(doc.fileSize)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="truncate">
                      {doc.uploadedBy.profile?.firstName && doc.uploadedBy.profile?.lastName
                        ? `${doc.uploadedBy.profile.firstName} ${doc.uploadedBy.profile.lastName}`
                        : doc.uploadedBy.email}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <Dialog
          title="Upload Document"
          onClose={() => {
            setShowUploadDialog(false);
            resetUploadForm();
          }}
        >
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Document Title
              </label>
              <Input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="Employee Handbook, Policy Document, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                required
              >
                <option value="policy">Policy</option>
                <option value="handbook">Handbook</option>
                <option value="form">Form</option>
                <option value="contract">Contract</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Brief description of the document..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                File Upload
              </label>
              <FileUpload
                onFileSelect={(file) => setUploadForm({ ...uploadForm, file })}
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                maxSize={25 * 1024 * 1024} // 25MB
              />
              {uploadForm.file && (
                <p className="text-sm text-slate-600 mt-2">
                  Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={uploading || !uploadForm.file}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUploadDialog(false);
                  resetUploadForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedDocument && (
        <DeleteDialog
          title="Delete Document"
          message={`Are you sure you want to delete "${selectedDocument.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
}

// Dialog Component
interface DialogProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Dialog({ title, onClose, children }: DialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// Delete Confirmation Dialog
interface DeleteDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteDialog({ title, message, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
          >
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
