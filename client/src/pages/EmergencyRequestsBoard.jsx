import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, ChevronRight, Clock, MapPin, Phone } from 'lucide-react';
import { emergencyRequestApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const getStatusBadge = (status) => {
  switch (status) {
    case 'open':
      return { emoji: '🔴', text: 'Open', color: 'bg-red-100 text-red-700' };
    case 'partially_fulfilled':
      return { emoji: '🟡', text: 'Partially Fulfilled', color: 'bg-yellow-100 text-yellow-700' };
    case 'fulfilled':
      return { emoji: '🟢', text: 'Fulfilled', color: 'bg-green-100 text-green-700' };
    case 'closed':
      return { emoji: '⚫', text: 'Closed', color: 'bg-gray-100 text-gray-700' };
    default:
      return { emoji: '❓', text: status, color: 'bg-gray-100 text-gray-700' };
  }
};

const EmergencyRequestCard = ({ request, onClaim, claimedBySelf }) => {
  const buyer = request.buyerId;
  const statusBadge = getStatusBadge(request.status);
  const createdAt = new Date(request.createdAt);
  const hoursAgo = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60));

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-[#d83c31] to-[#f4a261] p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">{request.title}</h2>
            <p className="text-sm opacity-90 mt-1">{request.productType}</p>
          </div>
          <span className={`rounded px-3 py-1 text-xs font-bold whitespace-nowrap ${statusBadge.color}`}>
            {statusBadge.emoji} {statusBadge.text}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle size={16} className="text-[#d83c31]" />
          <span className="font-bold text-[#1f1f1f]">Need: {request.quantity}</span>
        </div>

        {request.description && (
          <p className="text-sm text-[#666]">{request.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-[#999]">
          <Clock size={14} />
          <span>
            {hoursAgo === 0 ? 'Just now' : `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`}
          </span>
        </div>

        <div className="rounded-lg border border-[#e0e0e0] p-2 bg-[#f8f8f8]">
          <p className="text-xs font-bold text-[#2f6152]">Posted by</p>
          <p className="text-sm font-bold text-[#1f1f1f] mt-1">{buyer?.name}</p>
          {buyer?.phoneNumber && (
            <p className="text-xs text-[#666] mt-1">📞 {buyer.phoneNumber}</p>
          )}
        </div>

        {request.claimedBy && request.claimedBy.length > 0 && (
          <div className="rounded-lg border border-[#cfe3da] p-2 bg-[#f0faf7]">
            <p className="text-xs font-bold text-[#2f6152]">Claims ({request.claimedBy.length})</p>
            <div className="mt-1 space-y-1">
              {request.claimedBy.map((claim, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      claim.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : claim.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {claim.status}
                  </span>
                  <span className="text-xs font-semibold text-[#1f1f1f]">
                    {claim.sellerId?.name}: {claim.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!claimedBySelf && request.status !== 'fulfilled' && (
          <Button
            onClick={onClaim}
            className="w-full bg-[#1f9f6a] font-bold"
          >
            <Check size={16} /> Claim This Request
          </Button>
        )}

        {claimedBySelf && (
          <div className="rounded-lg bg-[#e8f8f1] border border-[#a8d5bd] p-2">
            <p className="text-xs font-bold text-[#0f3d2f]">✅ You have claimed this request</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export const EmergencyRequestsBoard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const [claimQuantity, setClaimQuantity] = useState('');

  const [filters, setFilters] = useState({
    status: 'open',
    productType: '',
    radius: 50,
  });

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const params = {
          ...filters,
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            params.latitude = position.coords.latitude;
            params.longitude = position.coords.longitude;
          });
        }

        const response = await emergencyRequestApi.list(params);
        setRequests(response.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load emergency requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [filters]);

  const handleClaim = async (requestId) => {
    if (!claimQuantity.trim()) {
      setError('Please enter the quantity you can provide');
      setClaimingId(null);
      return;
    }

    try {
      const payload = { quantity: claimQuantity };
      await emergencyRequestApi.claim(requestId, payload);

      // Refresh requests
      const response = await emergencyRequestApi.list(filters);
      setRequests(response.data.data || []);

      setClaimingId(null);
      setClaimQuantity('');
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to claim request');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <p className="text-lg font-bold text-[#666]">Loading emergency requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#2f5f50]">
        <span>Community</span>
        <ChevronRight size={14} />
        <span className="text-[#123327]">Emergency Board</span>
      </div>

      <div className="rounded-2xl border border-[#c83e35] bg-[#fff0ed] p-4 flex gap-2">
        <AlertCircle size={20} className="text-[#c83e35] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#c83e35]">Real-time Food Security</p>
          <p className="text-sm text-[#666] mt-1">
            These are critical needs from nearby communities. Help save lives during emergencies.
          </p>
        </div>
      </div>

      {user?.role === 'buyer' && (
        <Button
          onClick={() => navigate('/emergency-request')}
          className="w-full bg-[#d83c31] font-black text-white h-12"
        >
          🚨 Post Your Emergency Need
        </Button>
      )}

      <div className="rounded-2xl border border-[#cfe3da] bg-white p-4 space-y-3">
        <p className="font-bold text-[#1f1f1f]">Filters</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="h-10 rounded-lg border border-[#c9ddd4] bg-[#f8fcfa] px-3 text-sm font-semibold text-[#193f30]"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
          </select>

          <Input
            placeholder="Product type (optional)"
            value={filters.productType}
            onChange={(e) =>
              setFilters({ ...filters, productType: e.target.value })
            }
            className="h-10"
          />

          <select
            value={filters.radius}
            onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
            className="h-10 rounded-lg border border-[#c9ddd4] bg-[#f8fcfa] px-3 text-sm font-semibold text-[#193f30]"
          >
            <option value="25">25 km radius</option>
            <option value="50">50 km radius</option>
            <option value="100">100 km radius</option>
            <option value="150">150 km radius</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[#efc7c7] bg-[#fff2f2] px-4 py-3 text-sm font-semibold text-[#b11e1e]">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-[#dbe9e3] bg-[#f7fcfa] p-8 text-center">
          <p className="text-lg font-bold text-[#2f5f50]">
            👍 No emergency requests in your area right now.
          </p>
          <p className="text-sm text-[#666] mt-2">
            {user?.role === 'buyer'
              ? 'Check back later or post your own emergency request.'
              : 'Check back later to help communities in need.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => {
            const claimedBySelf = request.claimedBy?.some(
              (claim) => claim.sellerId?._id === user?._id,
            );

            return (
              <div key={request._id}>
                {claimingId === request._id ? (
                  <Card className="p-4 space-y-3 border-[#d83c31]">
                    <p className="font-bold text-[#1f1f1f]">How much can you provide?</p>
                    <Input
                      placeholder="e.g., 100 kg"
                      value={claimQuantity}
                      onChange={(e) => setClaimQuantity(e.target.value)}
                      className="h-10"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setClaimingId(null);
                          setClaimQuantity('');
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleClaim(request._id)}
                        className="flex-1 bg-[#1f9f6a] font-bold"
                      >
                        Confirm
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <EmergencyRequestCard
                    request={request}
                    claimedBySelf={claimedBySelf}
                    onClaim={() => setClaimingId(request._id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
