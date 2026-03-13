import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Plus, Edit, Pause, Trash2, Eye, TrendingUp, MessageSquare, Package } from 'lucide-react';
import { productApi } from '../lib/api';
import { formatCurrency, getListingEstimatedTotal } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const historyRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last14', label: 'Last 14 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'last90', label: 'Last 90 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'previousMonth', label: 'Previous month' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'last12Months', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];

const getDateRangeBounds = (range) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return { from: startOfToday, to: now };
    case 'last7': {
      const from = new Date(startOfToday);
      from.setDate(from.getDate() - 6);
      return { from, to: now };
    }
    case 'last14': {
      const from = new Date(startOfToday);
      from.setDate(from.getDate() - 13);
      return { from, to: now };
    }
    case 'last30': {
      const from = new Date(startOfToday);
      from.setDate(from.getDate() - 29);
      return { from, to: now };
    }
    case 'last90': {
      const from = new Date(startOfToday);
      from.setDate(from.getDate() - 89);
      return { from, to: now };
    }
    case 'thisMonth': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: now };
    }
    case 'previousMonth': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from, to };
    }
    case 'ytd': {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from, to: now };
    }
    case 'last12Months': {
      const from = new Date(startOfToday);
      from.setMonth(from.getMonth() - 12);
      return { from, to: now };
    }
    case 'all':
    default:
      return { from: null, to: null };
  }
};

const formatRangeDate = (value) =>
  value
    ? value.toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const SellerDashboardPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedHistoryRange, setSelectedHistoryRange] = useState('last30');
  const [stats, setStats] = useState({
    activeListings: 0,
    activeBuyers: 0,
    totalSales: 0,
  });

  const loadMine = async (historyRange) => {
    try {
      const [activeResponse, historyResponse] = await Promise.all([
        productApi.myActive(),
        productApi.myHistory({ range: historyRange }),
      ]);

      const productsData = activeResponse.data.data || [];
      const historyData = historyResponse.data.data || [];

      setProducts(productsData);
      setHistory(historyData);

      const totalSoldQuantity = historyData
        .filter((item) => item.status === 'sold')
        .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

      setStats({
        activeListings: productsData.length,
        activeBuyers: 0,
        totalSales: totalSoldQuantity,
      });
    } catch (_error) {
      setProducts([]);
      setHistory([]);
      setStats({
        activeListings: 0,
        activeBuyers: 0,
        totalSales: 0,
      });
    }
  };

  useEffect(() => {
    loadMine(selectedHistoryRange);
  }, [selectedHistoryRange]);

  const markSold = async (id) => {
    await productApi.markSold(id);
    await loadMine(selectedHistoryRange);
  };

  const remove = async (id) => {
    await productApi.remove(id);
    await loadMine(selectedHistoryRange);
  };

  const archiveProduct = async (id) => {
    if (window.confirm('Are you sure you want to archive this listing?')) {
      await productApi.archive(id);
      await loadMine(selectedHistoryRange);
    }
  };

  const { from: rangeFrom, to: rangeTo } = useMemo(
    () => getDateRangeBounds(selectedHistoryRange),
    [selectedHistoryRange],
  );

  const dateFilteredHistory = useMemo(() => {
    return history.filter((item) => {
      const updated = new Date(item.updatedAt);
      if (Number.isNaN(updated.getTime())) {
        return false;
      }

      if (rangeFrom && updated < rangeFrom) {
        return false;
      }
      if (rangeTo && updated > rangeTo) {
        return false;
      }
      return true;
    });
  }, [history, rangeFrom, rangeTo]);

  const soldInRange = useMemo(
    () => dateFilteredHistory.filter((item) => item.status === 'sold'),
    [dateFilteredHistory],
  );

  const completedOrders = soldInRange.length;
  const inactiveListings = dateFilteredHistory.filter((item) => item.status === 'inactive').length;
  const totalSoldQuantity = soldInRange.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalSoldRevenue = soldInRange.reduce(
    (sum, item) => sum + getListingEstimatedTotal(item.price, item.quantity),
    0,
  );
  const profileImageUrl = user?.avatarUrl || '';
  const profileInitial = (user?.name || 'Seller').trim().charAt(0).toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-[#f7f8f7]">
      <div className="px-2 sm:px-6 py-4 space-y-4 sm:space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1f1f1f]">Dashboard</h1>
          <div className="flex gap-2 sm:gap-3">
            <Link to="/create-listing">
              <button className="flex items-center gap-2 rounded-lg bg-[#20a46b] px-4 py-2.5 font-semibold text-white hover:bg-[#1a8657] w-full sm:w-auto">
                <Plus size={16} />
                <span className="hidden xs:inline">Add New Crop</span>
                <span className="inline xs:hidden">Add</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Seller Profile Card */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.name || 'Seller'}
                    className="h-16 w-16 rounded-full border-2 border-[#9bc7b4] object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#9bc7b4] bg-[#1f9f6a] text-2xl font-black text-white">
                    {profileInitial}
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <h3 className="text-xl font-black text-[#1f1f1f]">{user?.name || 'Seller'}</h3>
                    <p className="text-sm text-[#666]">Trusted produce partner</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-[#f0f9f5] px-2.5 py-1 text-[#2a5a45]">
                      Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) : 'Recently'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-[#3f4a45] sm:grid-cols-2">
                    <p className="rounded-lg bg-[#f7faf8] px-2 py-1">
                      <span className="font-bold text-[#1f1f1f]">Phone:</span> {user?.phoneNumber || 'Not set'}
                    </p>
                    <p className="rounded-lg bg-[#f7faf8] px-2 py-1">
                      <span className="font-bold text-[#1f1f1f]">Email:</span> {user?.email || 'Not set'}
                    </p>
                    <p className="rounded-lg bg-[#f7faf8] px-2 py-1 sm:col-span-2">
                      <span className="font-bold text-[#1f1f1f]">Location:</span> {user?.locationName || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid min-w-48 grid-cols-1 gap-2 text-sm">
                <div className="rounded-lg border border-[#d0e0d6] bg-[#f0f9f5] px-3 py-2">
                  <p className="text-xs font-semibold text-[#55796a]">Account Status</p>
                  <p className="font-black text-[#1a8657]">Identity & contact confirmed</p>
                </div>
                <div className="rounded-lg border border-[#dbe3df] bg-[#fafcfb] px-3 py-2">
                  <p className="text-xs font-semibold text-[#66736d]">Notifications</p>
                  <p className="font-black text-[#2f4c40]">{user?.notificationEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className="rounded-lg border border-[#dbe3df] bg-[#fafcfb] px-3 py-2">
                  <p className="text-xs font-semibold text-[#66736d]">Current Role</p>
                  <p className="font-black text-[#2f4c40]">Seller</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 flex flex-col gap-3">
            <div className="space-y-3">
              <div className="rounded-lg border border-[#d0e0d6] bg-[#f0f9f5] p-3">
                <p className="text-xs font-semibold text-[#666] mb-1">Active Listings</p>
                <p className="text-3xl font-black text-[#20a46b]">{stats.activeListings}</p>
              </div>
              <div className="rounded-lg border border-[#e0d0f0] bg-[#f7f0ff] p-3">
                <p className="text-xs font-semibold text-[#666] mb-1">Active Buyers</p>
                <p className="text-3xl font-black text-[#7a40e0]">{stats.activeBuyers || 0}</p>
              </div>
              <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
                <p className="text-xs font-semibold text-[#666] mb-1">Total Sales</p>
                <p className="text-2xl font-black text-[#1f1f1f]">{Math.round(totalSoldQuantity) || 0}kg <span className="text-sm">📈</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* View Crops Button */}
        <button className="flex items-center gap-2 rounded-lg border border-[#20a46b] bg-white px-4 py-2 font-semibold text-[#20a46b] hover:bg-[#f0f9f5] w-full sm:w-auto">
          <Eye size={16} />
          <span className="hidden xs:inline">View crops</span>
          <span className="inline xs:hidden">Crops</span>
        </button>

        {/* Active Listings Table - Responsive */}
        <div className="rounded-lg border border-[#d8ddda] bg-white overflow-x-auto">
          <div className="px-2 sm:px-6 py-4 border-b border-[#e0e5e1]">
            <h2 className="text-xl sm:text-2xl font-black text-[#1f1f1f]">Active Listings</h2>
          </div>
          <table className="min-w-[600px] w-full text-sm">
            <thead className="border-b border-[#e0e5e1] bg-[#f9fbfa]">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-[#666] whitespace-nowrap">Product Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-[#666] whitespace-nowrap">Quantity</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-[#666] whitespace-nowrap">Price</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-[#666] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e1]">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-[#f9fbfa] transition">
                  <td className="px-4 sm:px-6 py-4 text-left align-top">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={product.imageUrl} alt={product.title} className="h-10 w-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1f1f1f] truncate">{product.title}</p>
                        <p className="text-xs text-[#999] truncate">{product.productType} • {product.location?.locationName || 'No location'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-left font-semibold text-[#1f1f1f] align-top whitespace-nowrap">{product.quantity}</td>
                  <td className="px-4 sm:px-6 py-4 text-left font-semibold text-[#1f1f1f] align-top whitespace-nowrap">
                    <div>
                      <p>{formatCurrency(product.price)} / unit</p>
                      <p className="text-xs font-semibold text-[#666]">
                        Est. total {formatCurrency(getListingEstimatedTotal(product.price, product.quantity))}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-left align-top whitespace-nowrap">
                    <div className="flex flex-row items-center gap-2">
                      <Link to={`/create-listing?edit=${product._id}`}>
                        <button className="px-3 py-1 text-sm font-semibold text-[#20a46b] hover:bg-[#f0f9f5] rounded">
                          Edit
                        </button>
                      </Link>
                      <button 
                        onClick={() => markSold(product._id)}
                        className="px-3 py-1 text-sm font-semibold text-[#f0a000] hover:bg-[#fffbf0] rounded"
                      >
                        Sold
                      </button>
                      <button 
                        onClick={() => archiveProduct(product._id)}
                        className="px-3 py-1 text-sm font-semibold text-[#e0b000] hover:bg-[#fff8e1] rounded"
                      >
                        Archive
                      </button>
                      <button 
                        onClick={() => remove(product._id)}
                        className="px-3 py-1 text-sm font-semibold text-red-600 hover:bg-[#fff0f0] rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-8 text-center text-sm text-[#666]">
                    No active listings yet. Add your first crop to see data here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Sales & Performance Chart */}
        <div className="rounded-lg border border-[#d8ddda] bg-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#1f1f1f]">Recent Sales & Performance Chart</h2>
            <select
              value={selectedHistoryRange}
              onChange={(event) => setSelectedHistoryRange(event.target.value)}
              className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#20a46b] outline-none w-full sm:w-auto"
              aria-label="Select history range"
            >
              {historyRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Performance Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5e9] text-[#20a46b]">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f1f1f]">Completed Orders</p>
                  <p className="text-2xl font-black text-[#20a46b]">{completedOrders}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5e9] text-[#20a46b]">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f1f1f]">Archived Listings</p>
                  <p className="text-2xl font-black text-[#20a46b]">{inactiveListings}</p>
                  {/* Archived listings are your past/expired/removed products. They are not visible to buyers but you can review them here for your records. */}
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="lg:col-span-2 min-h-48 rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] flex items-center justify-center">
              <div className="w-full p-4">
                <div className="text-center">
                <p className="text-sm text-[#999]">{dateFilteredHistory.length} historical listings in selected range</p>
                <p className="text-xs text-[#ccc]">
                  Date range: {formatRangeDate(rangeFrom)} - {formatRangeDate(rangeTo)}
                </p>
                <p className="text-xs text-[#ccc]">Total sold quantity: {Math.round(totalSoldQuantity)}kg</p>
                <p className="text-xs text-[#ccc]">Estimated revenue: {formatCurrency(totalSoldRevenue)}</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
