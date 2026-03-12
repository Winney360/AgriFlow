import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Plus, Edit, Pause, Trash2, Eye, TrendingUp, MessageSquare, Package } from 'lucide-react';
import { productApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';

export const SellerDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingMessages: 0,
    totalSales: 0,
  });

  const loadMine = async () => {
    const response = await productApi.myActive();
    const productsData = response.data.data || [];
    setProducts(productsData);
    
    // Calculate stats
    setStats({
      activeListings: productsData.length,
      pendingMessages: 4,
      totalSales: productsData.reduce((sum, p) => sum + (p.quantity || 0), 0),
    });
  };

  useEffect(() => {
    loadMine().catch(() => setProducts([]));
  }, []);

  const markSold = async (id) => {
    await productApi.markSold(id);
    await loadMine();
  };

  const remove = async (id) => {
    await productApi.remove(id);
    await loadMine();
  };

  // Fallback products for demo
  const displayProducts = products.length > 0 ? products : [
    {
      _id: '1',
      title: 'Fresh Red Tomatoes, Juja',
      price: 4300,
      quantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b32?auto=format&fit=crop&w=80&q=80',
    },
    {
      _id: '2',
      title: 'White Maize',
      price: 4900,
      quantity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1601593768799-76ea57f57b61?auto=format&fit=crop&w=80&q=80',
    },
    {
      _id: '3',
      title: 'Cassava',
      price: 4300,
      quantity: 120,
      imageUrl: 'https://images.unsplash.com/photo-1615484477878-7f980bdc5d80?auto=format&fit=crop&w=80&q=80',
    },
  ];

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
                  <h3 className="text-xl font-black text-[#1f1f1f]">JujaFreshFarm</h3>
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
                {displayProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-[#f9fbfa] transition">
                    <td className="px-6 py-4 text-left">
                      <input type="checkbox" className="h-4 w-4" />
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl} alt={product.title} className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="font-semibold text-[#1f1f1f]">{product.title}</p>
                          <p className="text-xs text-[#999]">{product.title}</p>
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sales & Performance Chart */}
        <div className="rounded-lg border border-[#d8ddda] bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#1f1f1f]">Recent Sales & Performance Chart</h2>
            <button className="text-sm font-semibold text-[#20a46b] hover:underline">
              Last 30 days ▼
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5e9] text-[#20a46b]">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f1f1f]">JWT Verified Seller</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5e9] text-[#20a46b]">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f1f1f]">Trust Score</p>
                  <p className="text-2xl font-black text-[#20a46b]">4.7</p>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="lg:col-span-2 h-48 rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-[#999]">Sales chart visualization</p>
                <p className="text-xs text-[#ccc]">Line chart showing sales trend for last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
