import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {
  Bell,
  Check,
  CircleUserRound,
  Mail,
  MapPin,
  Phone,
  Repeat2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ENGLISH_MAP_ATTRIBUTION, ENGLISH_MAP_TILE_URL } from '../lib/mapTiles';
import { greenMarkerIcon } from '../lib/mapMarkerIcon';
import { formatCurrency, getListingEstimatedTotal, parseNumericValue } from '../lib/utils';
import { productApi, emergencyRequestApi } from '../lib/api';

const formatShortDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, switchRole, toggleNotifications, updateProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [activityBusy, setActivityBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  const [activeListings, setActiveListings] = useState([]);
  const [historyListings, setHistoryListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [mapQuery, setMapQuery] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    locationName: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      locationName: user.locationName || '',
      avatarUrl: user.avatarUrl || '',
    });
  }, [user]);

  const onAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const nextAvatar = String(reader.result || '');
      setProfileForm((prev) => ({ ...prev, avatarUrl: nextAvatar }));

      try {
        setAvatarBusy(true);
        setSaveMessage('');
        setError('');
        await updateProfile({ avatarUrl: nextAvatar });
        setSaveMessage('Display picture updated.');
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to update display picture');
      } finally {
        setAvatarBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onRemoveAvatar = async () => {
    setProfileForm((prev) => ({ ...prev, avatarUrl: '' }));
    try {
      setAvatarBusy(true);
      setSaveMessage('');
      setError('');
      await updateProfile({ avatarUrl: '' });
      setSaveMessage('Display picture removed.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove display picture');
    } finally {
      setAvatarBusy(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      setActiveListings([]);
      setHistoryListings([]);
      return;
    }

    const loadSellerActivity = async () => {
      setActivityBusy(true);
      try {
        const [activeRes, historyRes] = await Promise.all([
          productApi.myActive(),
          productApi.myHistory({ range: 'all' }),
        ]);
        setActiveListings(activeRes?.data?.data || []);
        setHistoryListings(historyRes?.data?.data || []);
      } catch {
        setActiveListings([]);
        setHistoryListings([]);
      } finally {
        setActivityBusy(false);
      }
    };

    loadSellerActivity();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      setMyRequests([]);
      return;
    }
    emergencyRequestApi.myRequests().then((res) => {
      setMyRequests(res?.data?.data || []);
    }).catch(() => setMyRequests([]));
  }, [user]);

  const nextRole = user?.role === 'buyer' ? 'seller' : 'buyer';
  const roleSwitchChecked = user?.role === 'seller';

  const soldHistory = historyListings.filter((item) => item.status === 'sold');
  const inactiveHistory = historyListings.filter((item) => item.status === 'inactive');
  const totalSoldQuantity = soldHistory.reduce((sum, item) => sum + parseNumericValue(item.quantity), 0);
  const totalRevenue = soldHistory.reduce(
    (sum, item) => sum + getListingEstimatedTotal(item.price, item.quantity),
    0,
  );
  const totalClosedDeals = soldHistory.length + inactiveHistory.length;
  const performancePercent =
    totalClosedDeals > 0 ? Math.round((soldHistory.length / totalClosedDeals) * 100) : 0;

  const recentListings = useMemo(() => {
    return [...activeListings, ...historyListings]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6);
  }, [activeListings, historyListings]);

  const recentActivity = useMemo(() => {
    return recentListings.slice(0, 5).map((item) => {
      const action = item.status === 'sold' ? 'Sold listing' : item.status === 'inactive' ? 'Archived listing' : 'Updated listing';
      return {
        id: item._id,
        action,
        title: item.title,
        date: formatShortDate(item.updatedAt),
      };
    });
  }, [recentListings]);

  const mapListings = useMemo(() => {
    const normalizedQuery = mapQuery.trim().toLowerCase();
    const allListings = [...activeListings, ...historyListings].filter(
      (item) => item.location?.latitude && item.location?.longitude,
    );

    if (!normalizedQuery) {
      return allListings;
    }

    return allListings.filter((item) => {
      const haystack = `${item.title} ${item.location?.locationName || ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeListings, historyListings, mapQuery]);

  const mapCenter = useMemo(() => {
    if (mapListings.length === 0) {
      return [-1.286389, 36.817223];
    }
    return [mapListings[0].location.latitude, mapListings[0].location.longitude];
  }, [mapListings]);

  const onSwitchRole = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await switchRole(nextRole);
      navigate(nextRole === 'seller' ? '/dashboard' : '/marketplace');
    } finally {
      setBusy(false);
    }
  };

  const onToggleNotifications = async () => {
    if (busy || !user) return;
    setBusy(true);
    setSaveMessage('');
    try {
      await toggleNotifications(!user.notificationEnabled);
      setSaveMessage('Notification preference updated.');
    } finally {
      setBusy(false);
    }
  };

  const onSaveProfile = async () => {
    if (!user) return;
    setSaveBusy(true);
    setError('');
    setSaveMessage('');
    try {
      await updateProfile(profileForm);
      setSaveMessage('Profile settings updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile settings');
    } finally {
      setSaveBusy(false);
    }
  };

  const profileImageUrl = profileForm.avatarUrl || user.avatarUrl || '';
  const profileInitial = (profileForm.name || user.name || '?').trim().charAt(0).toUpperCase() || '?';

  if (!user) {
    return <p className="py-10 text-center">Profile unavailable.</p>;
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-[#091f17]">Welcome & Overview</h1>

          <Card className="border-[#a9d4c2] bg-[#f6fbf9] p-0">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.3fr_1fr]">
              <div className="flex items-center gap-4 border-b border-[#d4e7de] p-4 md:border-b-0 md:border-r">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user.name}
                    className="h-16 w-16 rounded-full border-2 border-[#9bc7b4] object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#9bc7b4] bg-[#1f9f6a] text-2xl font-black text-white">
                    {profileInitial}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-3xl leading-none font-black text-[#0e2a1f]">{user.name}</p>
                  </div>
                  <p className="text-sm font-bold text-[#325749] capitalize">{user.role}</p>
                  {user.role === 'seller' ? (
                    <p className="text-sm font-semibold text-[#325749]">
                      Active listings: {activeListings.length} | Closed listings: {historyListings.length}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-[#325749]">
                      Buyer account · {user.locationName || 'Location not set'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 p-4">
                <p className="text-lg font-black text-[#0e2a1f]">Profile Details</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-xl border border-[#cde5da] bg-[#edf8f3] px-3 py-2 text-sm font-bold text-[#1d5743]">
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} /> Contact available
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#cde5da] bg-[#edf8f3] px-3 py-2 text-sm font-bold text-[#1d5743]">
                    <span className="inline-flex items-center gap-1">
                      {user.locationVerified ? <Check size={14} /> : <MapPin size={14} />}
                      Location: {user.locationVerified ? 'Verified' : 'Add location in settings'}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#cde5da] bg-[#edf8f3] px-3 py-2 text-sm font-bold text-[#1d5743]">
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} /> {user.phoneNumber || 'Not Added'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-[#a9d4c2] bg-[#f8fbfa]">
            <h2 className="text-4xl leading-none font-black tracking-tight text-[#12281f]">Settings Overview</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {/* 2x2 grid for first four fields on desktop */}
              <label className="rounded-xl bg-[#ecf6f1] p-3">
                <p className="mb-2 inline-flex items-center gap-2 font-black text-[#17342a]">
                  <CircleUserRound size={16} /> Display Picture
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onAvatarFileChange}
                    disabled={avatarBusy}
                    className="w-full rounded-lg border border-[#c6ddd2] bg-white px-2 py-2 text-sm font-semibold"
                  />
                </div>
                {profileForm.avatarUrl ? (
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold text-[#a81f1f] hover:underline"
                    onClick={onRemoveAvatar}
                    disabled={avatarBusy}
                  >
                    Remove picture
                  </button>
                ) : null}
              </label>
              <label className="rounded-xl bg-[#ecf6f1] p-3">
                <p className="mb-2 inline-flex items-center gap-2 font-black text-[#17342a]">
                  <CircleUserRound size={16} /> Full Name
                </p>
                <input
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-[#c6ddd2] bg-white px-3 text-sm font-semibold outline-none"
                />
              </label>
              <label className="rounded-xl bg-[#ecf6f1] p-3">
                <p className="mb-2 inline-flex items-center gap-2 font-black text-[#17342a]">
                  <Mail size={16} /> Email
                </p>
                <input
                  value={profileForm.email}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-[#c6ddd2] bg-white px-3 text-sm font-semibold outline-none"
                  placeholder="you@example.com"
                />
              </label>
              <label className="rounded-xl bg-[#ecf6f1] p-3">
                <p className="mb-2 inline-flex items-center gap-2 font-black text-[#17342a]">
                  <MapPin size={16} /> Location
                </p>
                <input
                  value={profileForm.locationName}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, locationName: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-[#c6ddd2] bg-white px-3 text-sm font-semibold outline-none"
                  placeholder="Town / Area"
                />
              </label>
            </div>
            {/* 3 by 1 arrangement for buttons on desktop */}
            <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:gap-4">
              <Button
                className="rounded-lg bg-[#1fa56f] px-4 font-bold w-full text-xs sm:text-base lg:w-auto"
                onClick={onSaveProfile}
                disabled={saveBusy}
              >
                <ShieldCheck size={16} /> {saveBusy ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button
                className="rounded-lg bg-[#1fa56f] px-4 font-bold w-full text-xs sm:text-base lg:w-auto"
                onClick={onToggleNotifications}
                disabled={busy}
              >
                <Bell size={16} /> Notifications {user.notificationEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="outline"
                className="rounded-lg border-[#1fa56f] bg-[#f8fbfa] text-[#0f5c40] w-full lg:w-auto"
                onClick={onSwitchRole}
                disabled={busy}
              >
                <Repeat2 size={16} /> Switch to {nextRole}
              </Button>
            </div>
            {saveMessage ? <p className="mt-3 text-sm font-semibold text-[#1c7d56]">{saveMessage}</p> : null}
            {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
            <Card
              id={user.role === 'buyer' ? 'my-emergency-requests' : undefined}
              className="border-[#a9d4c2] bg-[#f8fbfa] p-4"
            >
              <p className="text-3xl font-black text-[#12281f]">{user.role === 'seller' ? 'Recent Activity' : 'My Requests'}</p>
              {user.role === 'seller' ? (
                activityBusy ? (
                  <p className="mt-3 text-sm font-semibold text-[#3c6356]">Loading seller activity...</p>
                ) : recentActivity.length === 0 ? (
                  <p className="mt-3 text-sm font-semibold text-[#3c6356]">No recent seller activity yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {recentActivity.map((item) => (
                      <div key={item.id} className="rounded-xl border border-[#cde5da] bg-[#eef8f3] px-3 py-2">
                        <p className="font-black text-[#17342a]">{item.action}</p>
                        <p className="text-sm font-semibold text-[#3f695b]">{item.title}</p>
                        <p className="text-xs font-semibold text-[#557b6e]">{item.date}</p>
                      </div>
                    ))}
                  </div>
                )
              ) : myRequests.length === 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-[#3c6356]">No requests yet.</p>
                  <Link to="/emergency-request">
                    <Button className="mt-2 h-9 rounded-lg bg-[#1fa56f] text-sm font-bold text-white">Post a Request</Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {myRequests.slice(0, 4).map((req) => (
                    <div key={req._id} className="rounded-xl border border-[#cde5da] bg-[#eef8f3] px-3 py-2">
                      <p className="font-black text-[#17342a]">{req.title}</p>
                      <p className="text-xs font-semibold text-[#557b6e] capitalize">{req.status} · {req.productType}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
              <p className="text-3xl font-black text-[#12281f]">{user.role === 'seller' ? 'Recent Listings' : 'Quick Actions'}</p>
              {user.role === 'seller' ? (
                <div className="mt-3 space-y-3">
                  <Link to="/emergency-board">
                    <Button className="h-10 w-full rounded-lg bg-[#ff2b2b] font-bold text-white hover:bg-[#e61f1f]">View Emergency Requests</Button>
                  </Link>
                  <Link to="/emergency-board">
                    <Button variant="outline" className="h-10 w-full rounded-lg border-[#1fa56f] text-[#0f5c40]">View Request Board</Button>
                  </Link>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {recentListings.length === 0 ? (
                      <p className="text-sm font-semibold text-[#3c6356]">No listings yet.</p>
                    ) : (
                      recentListings.slice(0, 4).map((listing) => (
                        <article
                          key={listing._id}
                          className="overflow-hidden rounded-xl border border-[#c8e0d6] bg-white"
                        >
                          <img src={listing.imageUrl} alt={listing.title} className="h-24 w-full object-cover" />
                          <div className="space-y-1 p-2">
                            <p className="text-sm font-black text-[#17342a]">{listing.title}</p>
                            <p className="text-xs font-semibold text-[#567d70] capitalize">{listing.status}</p>
                            <p className="text-xs font-black text-[#183e31]">
                              {formatCurrency(listing.price)} / unit
                            </p>
                            <p className="text-[11px] font-semibold text-[#4f776a]">
                              Est. total {formatCurrency(getListingEstimatedTotal(listing.price, listing.quantity))}
                            </p>
                            <p className="text-xs font-semibold text-[#4f776a]">{formatShortDate(listing.updatedAt)}</p>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <Link to="/marketplace">
                    <Button className="h-10 w-full rounded-lg bg-[#1fa56f] font-bold text-white">Browse Marketplace</Button>
                  </Link>
                  <Link to="/emergency-request">
                    <Button className="h-10 w-full rounded-lg bg-[#c62828] font-bold text-white hover:bg-[#a81f1f]">Post Emergency Request</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
            <h3 className="text-3xl leading-none font-black text-[#12281f]">Terms & Privacy</h3>
            <div className="mt-3 space-y-2 text-sm font-semibold text-[#3f6659]">
              <p>
                AgriFlow connects local buyers and sellers of crops and livestock. By using the platform,
                you confirm listing information is accurate and that pricing, quantity, and delivery terms
                are communicated clearly with counterparties.
              </p>
              <p>
                Your profile data (name, contact, and location) is used to match nearby market opportunities
                and improve trust signals. Contact details are only shared to support transaction coordination.
              </p>
              <p>
                Sellers are responsible for listing quality and fulfillment. Buyers should verify produce
                condition before payment and report disputes through support channels.
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-[#091f17]">{user.role === 'seller' ? 'KPI Cards' : 'My Activity'}</h2>

          <div className="grid grid-cols-1 gap-3">
            {user.role === 'seller' ? (
              <>
                <Card className="border-[#9bcfb8] bg-[#dff4e9] p-4">
                  <p className="text-sm font-bold text-[#23483a]">Active Listings</p>
                  <p className="text-5xl leading-none font-black text-[#112d22]">{activeListings.length}</p>
                </Card>
                <Card className="border-[#e6dab6] bg-[#fff9e7] p-4">
                  <p className="text-sm font-bold text-[#5a4d2a]">Total Sales</p>
                  <p className="text-4xl leading-none font-black text-[#2d2817]">{Math.round(totalSoldQuantity)}kg</p>
                  <p className="text-sm font-semibold text-[#6d633f]">Revenue: {formatCurrency(totalRevenue)}</p>
                </Card>
                <Card className="border-[#c7e0d5] bg-[#f7fbf9] p-4">
                  <p className="text-sm font-bold text-[#204637]">Performance</p>
                  <p className="text-4xl leading-none font-black text-[#0f3327]">{performancePercent}%</p>
                  <p className="text-sm font-semibold text-[#45695c]">Closed listings sold successfully</p>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-[#9bcfb8] bg-[#dff4e9] p-4">
                  <p className="text-sm font-bold text-[#23483a]">My Requests</p>
                  <p className="text-5xl leading-none font-black text-[#112d22]">{myRequests.length}</p>
                </Card>
                <Card className="border-[#c8dff5] bg-[#eef6ff] p-4">
                  <p className="text-sm font-bold text-[#1a3a5c]">Location</p>
                  <p className="text-2xl leading-tight font-black text-[#0d2035]">{user.locationName || 'Not set'}</p>
                  <p className="text-sm font-semibold text-[#2e5e87]">Your browsing area</p>
                </Card>
                <Card className="border-[#c7e0d5] bg-[#f7fbf9] p-4">
                  <p className="text-sm font-bold text-[#204637]">Member Since</p>
                  <p className="text-2xl leading-tight font-black text-[#0f3327]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </Card>
              </>
            )}
          </div>

          <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
            <h3 className="text-4xl leading-none font-black text-[#12281f]">Contact & Location</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-[#ebf7f2] px-3 py-2 font-bold text-[#18573f]">
                <Phone size={16} /> {user.phoneNumber || 'Phone number not added'}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#ebf7f2] px-3 py-2 font-bold text-[#18573f]">
                <Mail size={16} /> {user.email || 'Email not added'}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#ebf7f2] px-3 py-2 font-bold text-[#18573f]">
                {user.locationVerified ? <Check size={16} /> : <MapPin size={16} />}
                Location {user.locationVerified ? 'Verified' : 'Not Verified'}
              </div>
            </div>
          </Card>

          {user.role === 'seller' && (
          <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
            <h3 className="text-4xl leading-none font-black text-[#12281f]">Map Search</h3>
            <div className="mt-3 rounded-xl border border-[#c8e0d6] bg-white p-2">
              <div className="mb-2 flex items-center rounded-lg border border-[#d5e6de] bg-[#f7fbf9] px-3">
                <Search size={16} className="text-[#5d7f72]" />
                <input
                  value={mapQuery}
                  onChange={(event) => setMapQuery(event.target.value)}
                  placeholder="Search by crop or location"
                  className="h-10 w-full bg-transparent px-2 text-sm font-semibold outline-none"
                />
              </div>

              <div className="h-56 overflow-hidden rounded-lg border border-[#d2e4db]">
                <MapContainer
                  key={`map-${mapCenter[0]}-${mapCenter[1]}-${mapListings.length}`}
                  center={mapCenter}
                  zoom={10}
                  className="h-full w-full"
                  attributionControl={false}
                >
                  <TileLayer url={ENGLISH_MAP_TILE_URL} />
                  {mapListings.map((listing) => (
                    <Marker
                      key={listing._id}
                      icon={greenMarkerIcon}
                      position={[listing.location.latitude, listing.location.longitude]}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{listing.title}</p>
                          <p>{listing.location?.locationName || 'Unnamed location'}</p>
                          <p className="capitalize">{listing.status}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <p className="mt-2 text-xs font-semibold text-[#45695c]">
                {mapListings.length} listing{mapListings.length !== 1 ? 's' : ''} matched
              </p>
            </div>
          </Card>
          )}

          {user.role === 'seller' ? (
            <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-black text-[#142f24]">You are currently:</p>
                  <p className="text-lg font-bold capitalize text-[#3b6557]">{user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={onSwitchRole}
                  disabled={busy}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    roleSwitchChecked ? 'bg-[#1ea26c]' : 'bg-[#8caea0]'
                  } disabled:opacity-60`}
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow transition ${
                      roleSwitchChecked ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="mt-3 text-sm font-bold text-[#3b6557]">Switch to {nextRole} mode</p>
            </Card>
          ) : null}

        </div>
      </div>
    </div>
  );
};
