import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Plus, Edit, Pause, Trash2, Eye, TrendingUp, MessageSquare, Package } from 'lucide-react';
import { productApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
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

export const SellerDashboardPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedHistoryRange, setSelectedHistoryRange] = useState('last30');
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingMessages: 0,
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
        pendingMessages: 0,
        totalSales: totalSoldQuantity,
      });
    } catch (_error) {
      setProducts([]);
      setHistory([]);
      setStats({
        activeListings: 0,
        pendingMessages: 0,
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

  const completedOrders = history.filter((item) => item.status === 'sold').length;
  const inactiveListings = history.filter((item) => item.status === 'inactive').length;

  return (
    <div className="min-h-screen bg-[#f7f8f7]">
      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-[#1f1f1f]">Dashboard</h1>
          <div className="flex gap-3">
            <Link to="/create-listing">
              <button className="flex items-center gap-2 rounded-lg bg-[#20a46b] px-4 py-2.5 font-semibold text-white hover:bg-[#1a8657]">
                <Plus size={16} />
                Add New Crop
              </button>
            </Link>
            <button className="flex items-center gap-2 rounded-lg border border-[#d8ddda] bg-white px-4 py-2.5 font-semibold text-[#333] hover:bg-[#f9f9f9]">
              Create Request
            </button>
          </div>
        </div>

        {/* Seller Profile Card */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-[#d7e5da]" />
                <div>
                  <h3 className="text-xl font-black text-[#1f1f1f]">{user?.name || 'Seller'}</h3>
                  <p className="text-sm text-[#666]">Verified Seller</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#666]">Switch to Buyer Mode</span>
                <button className="relative inline-flex h-6 w-10 items-center rounded-full bg-[#ddd] transition-colors hover:bg-[#ccc]">
                  <span className="inline-block h-5 w-5 rounded-full bg-white transition-transform translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4">
            <div className="space-y-3">
              <div className="rounded-lg border border-[#d0e0d6] bg-[#f0f9f5] p-3">
                <p className="text-xs font-semibold text-[#666] mb-1">Active Listings</p>
                <p className="text-3xl font-black text-[#20a46b]">{stats.activeListings}</p>
              </div>
              <div className="rounded-lg border border-[#f0e8d0] bg-[#fffbf0] p-3">
                <p className="text-xs font-semibold text-[#666] mb-1">Pending Messages</p>
                <p className="text-3xl font-black text-[#f0a000]">{stats.pendingMessages}</p>
              </div>
              <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
                <p className="text-xs font-semibold text-[#666] mb-1">Total Sales</p>
                <p className="text-2xl font-black text-[#1f1f1f]">{stats.totalSales || 0}kg <span className="text-sm">📈</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* View Crops Button */}
        <button className="flex items-center gap-2 rounded-lg border border-[#20a46b] bg-white px-4 py-2 font-semibold text-[#20a46b] hover:bg-[#f0f9f5]">
          <Eye size={16} />
          View crops
        </button>

        {/* Active Listings Table */}
        <div className="rounded-lg border border-[#d8ddda] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e0e5e1]">
            <h2 className="text-2xl font-black text-[#1f1f1f]">Active Listings</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#e0e5e1] bg-[#f9fbfa]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#666] w-8">
                    <input type="checkbox" className="h-4 w-4" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e5e1]">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-[#f9fbfa] transition">
                    <td className="px-6 py-4 text-left">
                      <input type="checkbox" className="h-4 w-4" />
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl} alt={product.title} className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="font-semibold text-[#1f1f1f]">{product.title}</p>
                          <p className="text-xs text-[#999]">{product.productType} • {product.location?.locationName || 'No location'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left font-semibold text-[#1f1f1f]">{product.quantity}</td>
                    <td className="px-6 py-4 text-left font-semibold text-[#1f1f1f]">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <Link to={`/create-listing?edit=${product._id}`}>
                          <button className="px-3 py-1 text-sm font-semibold text-[#20a46b] hover:bg-[#f0f9f5] rounded">
                            Edit
                          </button>
                        </Link>
                        <button 
                          onClick={() => markSold(product._id)}
                          className="px-3 py-1 text-sm font-semibold text-[#f0a000] hover:bg-[#fffbf0] rounded"
                        >
                          Pause
                        </button>
                        <button 
                          onClick={() => remove(product._id)}
                          className="px-3 py-1 text-sm font-semibold text-red-600 hover:bg-[#fff0f0] rounded"
                        >
                          Delete
                        </button>
                        <button className="px-2 py-1 text-[#999] hover:bg-[#f9f9f9] rounded">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#666]">
                      No active listings yet. Add your first crop to see data here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sales & Performance Chart */}
        <div className="rounded-lg border border-[#d8ddda] bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#1f1f1f]">Recent Sales & Performance Chart</h2>
            <select
              value={selectedHistoryRange}
              onChange={(event) => setSelectedHistoryRange(event.target.value)}
              className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#20a46b] outline-none"
              aria-label="Select history range"
            >
              {historyRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="lg:col-span-2 h-48 rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-[#999]">{history.length} historical listings recorded</p>
                <p className="text-xs text-[#ccc]">Total sold quantity: {stats.totalSales}kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
