import { useEffect, useState } from 'react';
import { Download, Phone, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { productApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';

const fallbackHistory = [
  {
    _id: '1',
    title: 'Fresh Red Tomatoes, Juja',
    imageUrl: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b32?auto=format&fit=crop&w=60&q=80',
    quantity: '50 bags',
    price: 4300,
    totalAmount: 4500,
    saleDate: '10 March 2026',
    buyer: 'Green Harvest Ltd',
    status: 'completed',
  },
  {
    _id: '2',
    title: 'White Maize',
    imageUrl: 'https://images.unsplash.com/photo-1601593768799-76ea57f57b61?auto=format&fit=crop&w=60&q=80',
    quantity: '2,800kg',
    price: 4900,
    totalAmount: 4900,
    saleDate: '11 March 2026',
    buyer: 'Nairobi Fresh Market',
    status: 'disputed',
  },
  {
    _id: '3',
    title: 'Fresh Red Tomatoes, Juja',
    imageUrl: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b32?auto=format&fit=crop&w=60&q=80',
    quantity: '2,800kg',
    price: 4300,
    totalAmount: 4900,
    saleDate: '12 March 2026',
    buyer: 'County Produce Hub',
    status: 'disputed',
  },
  {
    _id: '4',
    title: 'Cassava',
    imageUrl: 'https://images.unsplash.com/photo-1615484477878-7f980bdc5d80?auto=format&fit=crop&w=60&q=80',
    quantity: '120 bags',
    price: 4300,
    totalAmount: 4500,
    saleDate: '13 March 2026',
    buyer: 'Riverside Buyers Group',
    status: 'canceled',
  },
  {
    _id: '5',
    title: 'Cassava',
    imageUrl: 'https://images.unsplash.com/photo-1615484477878-7f980bdc5d80?auto=format&fit=crop&w=60&q=80',
    quantity: '50 bags',
    price: 4300,
    totalAmount: 4500,
    saleDate: '15 March 2026',
    buyer: 'Farmers Choice Foods',
    status: 'completed',
  },
];

const statusConfig = {
  completed: { color: '#20a46b', bg: '#e8f5e9', text: 'Completed' },
  disputed: { color: '#f0a000', bg: '#fffbf0', text: 'Disputed' },
  canceled: { color: '#dc3545', bg: '#fff0f0', text: 'Canceled' },
  processing: { color: '#0066cc', bg: '#f0f7ff', text: 'Processing' },
};

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState(['Tomatoes']);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('Jan 2025');
  const [dateTo, setDateTo] = useState('Jan 2025');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await productApi.myHistory();
        setHistory(response.data.data || fallbackHistory);
      } catch {
        setHistory(fallbackHistory);
      }
    };

    loadHistory();
  }, []);

  const displayHistory = history.length > 0 ? history : fallbackHistory;

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleCropToggle = (crop) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8f7]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-6 py-6">
        {/* Left Sidebar */}
        <aside className="lg:col-span-1 space-y-4 h-fit sticky top-6">
          {/* Search Bar */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <h3 className="text-lg font-black text-[#1f1f1f]">Search Bar</h3>
            <input
              type="text"
              placeholder="Buyer Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-lg border border-[#d0d6d2] bg-white px-3 text-sm outline-none focus:border-[#20a46b]"
            />
            <p className="text-xs text-[#999]">Buyer Name, Product, Invoice ID</p>
            <p className="text-xs text-[#f0a000]">● Historical Data since Jan 2025</p>
          </div>

          {/* Date Range Filters */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <h3 className="text-sm font-black text-[#1f1f1f]">Date Range Filters</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-[#d0d6d2] bg-white px-2 py-2">
                <input
                  type="text"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 bg-transparent text-xs outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#d0d6d2] bg-white px-2 py-2">
                <input
                  type="text"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 bg-transparent text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Status Filters */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <h3 className="text-sm font-black text-[#1f1f1f]">Status Filters</h3>
            <div className="space-y-2">
              {['Completed', 'Canceled', 'Disputed', 'Processing', 'Pending Review'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStatus.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[#333]">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Crop Type Filters */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <h3 className="text-sm font-black text-[#1f1f1f]">Crop Type Filters</h3>
            <div className="space-y-2">
              {['Tomatoes', 'Maize', 'Onions', 'Cassava'].map((crop) => (
                <label key={crop} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCrops.includes(crop)}
                    onChange={() => handleCropToggle(crop)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[#333]">{crop}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#20a46b] px-4 py-2.5 font-semibold text-white hover:bg-[#1a8657]">
            <Download size={16} />
            Export Custom Report (CSV/PDF)
          </button>

          {/* Quick Links */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <h3 className="text-sm font-black text-[#1f1f1f]">Quick Links</h3>
            <div className="space-y-2">
              {[
                { icon: Eye, label: 'View Active Listings' },
                { icon: Phone, label: 'Contact Support' },
                { icon: null, label: 'Settings' },
              ].map((link, idx) => {
                const Icon = link.icon;
                return (
                  <button key={idx} className="flex w-full items-center gap-2 rounded px-2 py-1 text-sm text-[#333] hover:bg-[#f9f9f9]">
                    {Icon && <Icon size={14} />}
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Page Title */}
          <h1 className="text-4xl font-black text-[#1f1f1f]">Seller History</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="rounded-lg border border-[#d0e0d6] bg-[#f0f9f5] p-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[#20a46b]">✓</span>
                <p className="text-xs font-semibold text-[#666]">JWT Verified Seller</p>
              </div>
              <p className="text-2xl font-black text-[#20a46b]">4.7</p>
            </div>

            <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Total Completed Sales</p>
              <p className="text-2xl font-black text-[#1f1f1f]">156</p>
            </div>

            <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Total Revenue</p>
              <p className="text-xl font-black text-[#1f1f1f]">Ksh 1.2M</p>
            </div>

            <div className="rounded-lg border border-[#f0e8d0] bg-[#fffbf0] p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Best Selling Crop</p>
              <p className="text-xl font-black text-[#1f1f1f]">Tomatoes</p>
            </div>

            <div className="rounded-lg border border-[#ffe0d8] bg-[#fff0f0] p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Active Disputes</p>
              <p className="text-2xl font-black text-red-600">1</p>
            </div>

            <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Average Transaction Time</p>
              <p className="text-sm font-black text-[#1f1f1f]">2.5 days</p>
            </div>
          </div>

          {/* Sales History Table */}
          <div className="rounded-lg border border-[#d8ddda] bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e0e5e1] px-6 py-4">
              <h2 className="text-2xl font-black text-[#1f1f1f]">Sales History Table</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:bg-[#f9f9f9]">
                  <Filter size={14} />
                  Filters
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-[#20a46b] bg-white px-3 py-2 text-sm font-semibold text-[#20a46b] hover:bg-[#f0f9f5]">
                  <Eye size={14} />
                  View crops
                </button>
              </div>
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Price/Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Total Sale Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Sale Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e5e1]">
                  {displayHistory.map((item) => {
                    const statusConfig_ = statusConfig[item.status] || statusConfig.processing;
                    return (
                      <tr key={item._id} className="hover:bg-[#f9fbfa] transition">
                        <td className="px-6 py-4 text-left">
                          <input type="checkbox" className="h-4 w-4" />
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2">
                            <img src={item.imageUrl} alt={item.title} className="h-8 w-8 rounded object-cover" />
                            <div>
                              <p className="text-sm font-semibold text-[#1f1f1f]">{item.title}</p>
                              <p className="text-xs text-[#999]">{item.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left text-sm font-semibold text-[#1f1f1f]">{item.quantity}</td>
                        <td className="px-6 py-4 text-left text-sm font-semibold text-[#1f1f1f]">{formatCurrency(item.price)}</td>
                        <td className="px-6 py-4 text-left text-sm font-semibold text-[#1f1f1f]">{formatCurrency(item.totalAmount)}</td>
                        <td className="px-6 py-4 text-left text-sm text-[#666]">{item.saleDate}</td>
                        <td className="px-6 py-4 text-left text-sm font-semibold text-[#1f1f1f]">{item.buyer}</td>
                        <td className="px-6 py-4 text-left">
                          <span
                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ color: statusConfig_.color, backgroundColor: statusConfig_.bg }}
                          >
                            {statusConfig_.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left text-sm">
                          <div className="flex gap-2">
                            <button className="font-semibold text-[#20a46b] hover:underline">View Details</button>
                            <button className="flex items-center gap-1 font-semibold text-[#20a46b] hover:underline">
                              <Phone size={12} />
                              Contact Buyer
                            </button>
                            <button className="font-semibold text-[#20a46b] hover:underline">Download Invoice</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#e0e5e1] px-6 py-4">
              <p className="text-xs text-[#999]">Historical Data since Jan 2025</p>
              <div className="flex items-center gap-1">
                <button className="h-8 w-8 rounded border border-[#d8ddda] bg-white text-center font-semibold text-[#333] hover:bg-[#f9f9f9] text-sm">
                  <ChevronLeft size={14} className="inline" />
                </button>
                <button className="h-8 w-8 rounded border border-[#20a46b] bg-[#f0f9f5] text-center font-semibold text-[#20a46b] text-sm">
                  1
                </button>
                <button className="h-8 w-8 rounded border border-[#d8ddda] bg-white text-center font-semibold text-[#333] hover:bg-[#f9f9f9] text-sm">
                  2
                </button>
                <button className="h-8 w-8 rounded border border-[#d8ddda] bg-white text-center font-semibold text-[#333] hover:bg-[#f9f9f9] text-sm">
                  <ChevronRight size={14} className="inline" />
                </button>
                <button className="h-8 w-8 rounded border border-[#d8ddda] bg-white text-center font-semibold text-[#333] hover:bg-[#f9f9f9] text-sm">
                  »
                </button>
              </div>
            </div>
          </div>

          {/* Recent Sales & Performance Chart */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[#1f1f1f]">Recent Sales & Performance Chart</h2>
              <div className="flex gap-3">
                <select className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:border-[#20a46b]">
                  <option>All Crops</option>
                  <option>Tomatoes</option>
                  <option>Maize</option>
                </select>
                <select className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:border-[#20a46b]">
                  <option>All Source Types</option>
                </select>
                <select className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:border-[#20a46b]">
                  <option>Last 12 months</option>
                </select>
              </div>
            </div>

            <div className="h-64 rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-[#999]">Sales & Revenue chart visualization</p>
                <p className="text-xs text-[#ccc]">Area chart showing sales trend over time</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
