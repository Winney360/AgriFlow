import { useEffect, useState, useCallback } from 'react';
import { Download, Phone, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { productApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';

const ITEMS_PER_PAGE = 10;

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const statusConfig = {
  sold: { color: '#20a46b', bg: '#e8f5e9', text: 'Sold' },
  inactive: { color: '#888888', bg: '#f2f2f2', text: 'Archived' },
  completed: { color: '#20a46b', bg: '#e8f5e9', text: 'Completed' },
  disputed: { color: '#f0a000', bg: '#fffbf0', text: 'Disputed' },
  canceled: { color: '#dc3545', bg: '#fff0f0', text: 'Canceled' },
  processing: { color: '#0066cc', bg: '#f0f7ff', text: 'Processing' },
};


export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params =
        dateFrom && dateTo
          ? { range: 'custom', startDate: dateFrom, endDate: dateTo }
          : { range: 'all' };
      const response = await productApi.myHistory(params);
      setHistory(response.data.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Derived stats
  const soldItems = history.filter((i) => i.status === 'sold');
  const totalRevenue = soldItems.reduce((sum, i) => sum + (i.price || 0), 0);
  const cropCounts = history.reduce((acc, i) => {
    acc[i.title] = (acc[i.title] || 0) + 1;
    return acc;
  }, {});
  const bestCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const avgTransactionDays =
    history.length > 0
      ? (
          history.reduce(
            (sum, i) => sum + (new Date(i.updatedAt) - new Date(i.createdAt)),
            0,
          ) /
          history.length /
          (1000 * 60 * 60 * 24)
        ).toFixed(1)
      : '—';
  const archivedCount = history.filter((i) => i.status === 'inactive').length;

  // Dynamic crop list from real data
  const uniqueCrops = [...new Set(history.map((i) => i.title))];

  // Client-side filtering
  const filteredHistory = history
    .filter(
      (item) =>
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location?.locationName || '').toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((item) => selectedStatus.length === 0 || selectedStatus.includes(item.status))
    .filter(
      (item) =>
        selectedCrops.length === 0 ||
        selectedCrops.some((c) => item.title.toLowerCase().includes(c.toLowerCase())),
    );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
  const pagedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
    setCurrentPage(1);
  };

  const handleCropToggle = (crop) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop],
    );
    setCurrentPage(1);
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
              placeholder="Product Name or Location"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-9 rounded-lg border border-[#d0d6d2] bg-white px-3 text-sm outline-none focus:border-[#20a46b]"
            />
            <p className="text-xs text-[#999]">Product Name, Location</p>
            <p className="text-xs text-[#f0a000]">● All historical records</p>
          </div>

          {/* Date Range Filters */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <h3 className="text-sm font-black text-[#1f1f1f]">Date Range Filters</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-[#d0d6d2] bg-white px-2 py-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="flex-1 bg-transparent text-xs outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#d0d6d2] bg-white px-2 py-2">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="flex-1 bg-transparent text-xs outline-none"
                />
              </div>
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs text-[#20a46b] hover:underline"
              >
                Clear dates
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <h3 className="text-sm font-black text-[#1f1f1f]">Status Filters</h3>
            <div className="space-y-2">
              {[
                { label: 'Sold', value: 'sold' },
                { label: 'Archived', value: 'inactive' },
              ].map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStatus.includes(value)}
                    onChange={() => handleStatusToggle(value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[#333]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Crop Type Filters */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-4 space-y-3">
            <h3 className="text-sm font-black text-[#1f1f1f]">Crop Type Filters</h3>
            {uniqueCrops.length === 0 ? (
              <p className="text-xs text-[#999]">No crops loaded yet</p>
            ) : (
              <div className="space-y-2">
                {uniqueCrops.slice(0, 8).map((crop) => (
                  <label key={crop} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCrops.includes(crop)}
                      onChange={() => handleCropToggle(crop)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-[#333] truncate">{crop}</span>
                  </label>
                ))}
              </div>
            )}
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
              <p className="text-xs font-semibold text-[#666] mb-1">Total Items</p>
              <p className="text-2xl font-black text-[#20a46b]">{history.length}</p>
            </div>

            <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Total Completed Sales</p>
              <p className="text-2xl font-black text-[#1f1f1f]">{soldItems.length}</p>
            </div>

            <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Total Revenue</p>
              <p className="text-xl font-black text-[#1f1f1f]">
                {totalRevenue >= 1_000_000
                  ? `Ksh ${(totalRevenue / 1_000_000).toFixed(1)}M`
                  : formatCurrency(totalRevenue)}
              </p>
            </div>

            <div className="rounded-lg border border-[#f0e8d0] bg-[#fffbf0] p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Best Selling Crop</p>
              <p className="text-sm font-black text-[#1f1f1f] truncate">{bestCrop}</p>
            </div>

            <div className="rounded-lg border border-[#ffe0d8] bg-[#fff0f0] p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Archived Listings</p>
              <p className="text-2xl font-black text-red-600">{archivedCount}</p>
            </div>

            <div className="rounded-lg border border-[#d8ddda] bg-white p-3">
              <p className="text-xs font-semibold text-[#666] mb-1">Avg. Transaction Time</p>
              <p className="text-sm font-black text-[#1f1f1f]">
                {avgTransactionDays !== '—' ? `${avgTransactionDays} days` : '—'}
              </p>
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e5e1]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#999]">
                        Loading history...
                      </td>
                    </tr>
                  ) : pagedHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#999]">
                        No history records found.
                      </td>
                    </tr>
                  ) : (
                    pagedHistory.map((item) => {
                      const cfg = statusConfig[item.status] || statusConfig.inactive;
                      return (
                        <tr key={item._id} className="hover:bg-[#f9fbfa] transition">
                          <td className="px-6 py-4 text-left">
                            <input type="checkbox" className="h-4 w-4" />
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center gap-2">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="h-8 w-8 rounded object-cover"
                                />
                              )}
                              <p className="text-sm font-semibold text-[#1f1f1f]">{item.title}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left text-sm font-semibold text-[#1f1f1f]">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-left text-sm font-semibold text-[#1f1f1f]">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 text-left text-sm text-[#666]">
                            {item.location?.locationName || '—'}
                          </td>
                          <td className="px-6 py-4 text-left text-sm text-[#666]">
                            {formatDate(item.updatedAt)}
                          </td>
                          <td className="px-6 py-4 text-left">
                            <span
                              className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{ color: cfg.color, backgroundColor: cfg.bg }}
                            >
                              {cfg.text}
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
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#e0e5e1] px-6 py-4">
              <p className="text-xs text-[#999]">
                {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''} found
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded border border-[#d8ddda] bg-white text-center font-semibold text-[#333] hover:bg-[#f9f9f9] text-sm disabled:opacity-40"
                  >
                    <ChevronLeft size={14} className="inline" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded border text-center font-semibold text-sm ${
                        page === currentPage
                          ? 'border-[#20a46b] bg-[#f0f9f5] text-[#20a46b]'
                          : 'border-[#d8ddda] bg-white text-[#333] hover:bg-[#f9f9f9]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded border border-[#d8ddda] bg-white text-center font-semibold text-[#333] hover:bg-[#f9f9f9] text-sm disabled:opacity-40"
                  >
                    <ChevronRight size={14} className="inline" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Sales & Performance Chart */}
          <div className="rounded-lg border border-[#d8ddda] bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[#1f1f1f]">Recent Sales & Performance Chart</h2>
              <div className="flex gap-3">
                <select className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:border-[#20a46b]">
                  <option>All Crops</option>
                  {uniqueCrops.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
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
