import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X, Clock, User, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useToast } from '../ui/useToast';

interface ChangeRequest {
  id: string;
  userId: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
  user?: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      employeeId?: string;
    };
  };
}

export default function ChangeRequestApproval() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('psg_admin_token');

      const response = await fetch('/api/profile/change-request', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch change requests');

      const data = await response.json();
      const filteredRequests = filter === 'pending'
        ? data.requests.filter((r: ChangeRequest) => r.status === 'pending')
        : data.requests;

      setRequests(filteredRequests);
    } catch (error) {
      toast.error('Error', 'Failed to load change requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('psg_admin_token');

      const response = await fetch('/api/profile/change-request', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status,
          reviewComment: reviewComment || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to review request');
      }

      toast.success(
        'Success',
        `Change request ${status}`
      );

      setSelectedRequest(null);
      setReviewComment('');
      fetchRequests();
    } catch (error) {
      toast.error('Error', error instanceof Error ? error.message : 'Failed to review request');
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      preferredName: 'Preferred Name',
      email: 'Email',
      phone: 'Phone',
      addressLine1: 'Address Line 1',
      city: 'City',
      department: 'Department',
      jobTitle: 'Job Title',
      manager: 'Manager',
      // Ajoutez d'autres champs au besoin
    };
    return labels[field] || field;
  };

  const formatValue = (value: string): string => {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
      return parsed;
    } catch {
      return value;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Change Request Approval</h2>
          <p className="text-slate-600">Review and approve employee profile changes</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={filter === 'pending' ? 'warning' : 'default'}>
            {filter === 'pending' ? 'Pending Only' : 'All Requests'}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
          >
            {filter === 'pending' ? 'Show All' : 'Show Pending'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-slate-900">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Rejected</p>
              <p className="text-2xl font-bold text-slate-900">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No change requests found</p>
            <p className="text-sm mt-1">
              {filter === 'pending' ? 'No pending requests' : 'No requests yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 transition ${
                  request.status === 'pending'
                    ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
                    : request.status === 'approved'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {request.user?.profile?.firstName && request.user?.profile?.lastName
                            ? `${request.user.profile.firstName} ${request.user.profile.lastName}`
                            : request.user?.email}
                        </p>
                        {request.user?.profile?.employeeId && (
                          <p className="text-xs text-slate-600">ID: {request.user.profile.employeeId}</p>
                        )}
                      </div>
                      <Badge variant={getStatusColor(request.status) as any}>
                        {request.status}
                      </Badge>
                    </div>

                    {/* Change Details */}
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Field: {getFieldLabel(request.field)}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 mb-1">Current Value:</p>
                          <p className="text-slate-900 bg-slate-50 p-2 rounded">
                            {formatValue(request.oldValue) || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Requested Value:</p>
                          <p className="text-amber-900 bg-amber-50 p-2 rounded font-medium">
                            {formatValue(request.newValue)}
                          </p>
                        </div>
                      </div>
                      {request.reason && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Reason:</p>
                          <p className="text-sm text-slate-900 italic">"{request.reason}"</p>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-4 text-xs text-slate-600">
                        <span>Requested: {new Date(request.createdAt).toLocaleString()}</span>
                        {request.reviewedAt && (
                          <span>Reviewed: {new Date(request.reviewedAt).toLocaleString()}</span>
                        )}
                      </div>
                      {request.reviewComment && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-600 mb-1">Review Comment:</p>
                          <p className="text-sm text-slate-900">{request.reviewComment}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setReviewComment('');
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Change Request</h3>

            {/* Request Details */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">
                    {selectedRequest.user?.profile?.firstName && selectedRequest.user?.profile?.lastName
                      ? `${selectedRequest.user.profile.firstName} ${selectedRequest.user.profile.lastName}`
                      : selectedRequest.user?.email}
                  </p>
                  {selectedRequest.user?.profile?.employeeId && (
                    <p className="text-xs text-slate-600">ID: {selectedRequest.user.profile.employeeId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Field:</p>
                  <p className="font-medium">{getFieldLabel(selectedRequest.field)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Current:</p>
                  <p className="text-slate-900">{formatValue(selectedRequest.oldValue) || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Requested:</p>
                  <p className="text-amber-900 font-medium">{formatValue(selectedRequest.newValue)}</p>
                </div>
              </div>

              {selectedRequest.reason && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Reason:</p>
                  <p className="text-sm italic">"{selectedRequest.reason}"</p>
                </div>
              )}
            </div>

            {/* Review Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Review Comment (Optional)
              </label>
              <Input
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add a comment explaining your decision..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => handleReview('rejected')}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Processing...' : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleReview('approved')}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Processing...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null);
                setReviewComment('');
              }}
              className="mt-3 w-full"
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
