import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, ChevronRight, Clock, MapPin, Phone } from 'lucide-react';
import { emergencyRequestApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

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
      <div className="bg-linear-to-r from-[#1f9f6a] to-[#27b883] p-4 text-white">
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
          <div className="rounded-lg bg-[#f0faf7] border-2 border-[#1f9f6a] p-2">
            <p className="text-xs font-bold text-[#1f9f6a]">✅ You have claimed this request</p>
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
  const toastShownRef = useRef(false); // Add ref to track if toast has been shown

  const [filters, setFilters] = useState({
    status: 'open',
    productType: '',
    radius: 50,
  });

  // Function to load requests
  const loadRequests = async (params = filters) => {
    try {
      setLoading(true);
      const response = await emergencyRequestApi.list(params);
      setRequests(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load emergency requests');
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeWithLocation = async () => {
      try {
        setLoading(true);
        const params = { ...filters };

        // Only show toast if it hasn't been shown before
        if (!toastShownRef.current) {
          toastShownRef.current = true; // Mark as shown immediately
          
          toast.custom((toastItem) => (
            <div className="w-full max-w-sm rounded-lg border border-[#20a46b] bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-[#1f1f1f]">Allow GPS access to filter requests by your location?</p>
              <p className="mt-1 text-xs text-[#5a6b64]">
                Tap Allow now to continue and approve location permission in your browser.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.dismiss(toastItem);
                    // Load requests without location
                    loadRequests(params);
                  }}
                  className="h-10 rounded-md border border-[#d0d6d2] bg-white px-3 text-sm font-semibold text-[#334a41]"
                >
                  Not now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.dismiss(toastItem);
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          // Add location to params and load
                          params.latitude = position.coords.latitude;
                          params.longitude = position.coords.longitude;
                          loadRequests(params);
                        },
                        (error) => {
                          console.error('Geolocation error:', error);
                          // Load without location if permission denied
                          loadRequests(params);
                        }
                      );
                    } else {
                      // Geolocation not supported
                      loadRequests(params);
                    }
                  }}
                  className="h-10 rounded-md bg-[#20a46b] px-3 text-sm font-semibold text-white"
                >
                  Allow now
                </button>
              </div>
            </div>
          ), { duration: Infinity });
        } else {
          // Toast already shown, just load requests
          loadRequests(params);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load emergency requests');
        setLoading(false);
      }
    };

    initializeWithLocation();
  }, []); // Empty dependency array - runs only once on mount

  // Separate effect for filter changes
  useEffect(() => {
    // Don't run on initial mount (when requests is empty)
    if (requests.length > 0 || !loading) {
      loadRequests(filters);
    }
  }, [filters.status, filters.productType, filters.radius]); // Only reload when filters change

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

      <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4 flex gap-2">
        <AlertCircle size={20} className="text-[#1f9f6a] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#1f9f6a]">Real-time Food Security</p>
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

      <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-4 space-y-3">
        <p className="font-bold text-[#1f9f6a]">Filters</p>

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
        <div className="rounded-2xl border-2 border-[#1f9f6a] bg-[#f0faf7] p-8 text-center">
          <p className="text-lg font-bold text-[#1f9f6a]">
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