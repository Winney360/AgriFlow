import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Download, Phone, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';
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

const chartRangeOptions = [
  { value: 'last3Months', label: 'Last 3 months' },
  { value: 'last6Months', label: 'Last 6 months' },
  { value: 'last12Months', label: 'Last 12 months' },
  { value: 'last24Months', label: 'Last 24 months' },
  { value: 'all', label: 'All time' },
];

const monthFormatter = new Intl.DateTimeFormat('en-KE', {
  month: 'short',
  year: '2-digit',
});

const getRangeStartDate = (range, now = new Date()) => {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (range) {
    case 'last3Months':
      start.setMonth(start.getMonth() - 2);
      return start;
    case 'last6Months':
      start.setMonth(start.getMonth() - 5);
      return start;
    case 'last12Months':
      start.setMonth(start.getMonth() - 11);
      return start;
    case 'last24Months':
      start.setMonth(start.getMonth() - 23);
      return start;
    case 'all':
    default:
      return null;
  }
};

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const createMonthlyBuckets = (startDate, endDate) => {
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const buckets = [];

  while (cursor <= last) {
    buckets.push({
      key: getMonthKey(cursor),
      date: new Date(cursor),
      label: monthFormatter.format(cursor),
      revenue: 0,
      salesCount: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets;
};

const buildAreaPath = (points, baselineY) => {
  if (!points.length) return '';

  const line = points.map((point) => `${point.x},${point.y}`).join(' L ');
  return `M ${points[0].x},${baselineY} L ${line} L ${points[points.length - 1].x},${baselineY} Z`;
};

const resolveCreatedLocation = (item) => {
  const locationName =
    item?.location?.locationName ||
    item?.locationName ||
    item?.createdLocationName ||
    item?.createdFromLocation;

  if (typeof locationName === 'string' && locationName.trim()) {
    return locationName.trim();
  }

  return '—';
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
  const [chartCrop, setChartCrop] = useState('all');
  const [chartSourceType, setChartSourceType] = useState('all');
  const [chartTimeRange, setChartTimeRange] = useState('last12Months');

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
  const sourceTypes = useMemo(
    () => [...new Set(history.map((item) => item.productType).filter(Boolean))],
    [history],
  );

  const chartData = useMemo(() => {
    const now = new Date();
    const soldItems = history.filter((item) => item.status === 'sold');

    const cropFiltered = soldItems.filter(
      (item) => chartCrop === 'all' || item.title === chartCrop,
    );

    const sourceFiltered = cropFiltered.filter(
      (item) => chartSourceType === 'all' || item.productType === chartSourceType,
    );

    const rangeStart = getRangeStartDate(chartTimeRange, now);
    const timeFiltered = sourceFiltered.filter((item) => {
      if (!rangeStart) return true;
      const updated = new Date(item.updatedAt);
      return !Number.isNaN(updated.getTime()) && updated >= rangeStart;
    });

    if (timeFiltered.length === 0) {
      return {
        buckets: [],
        maxRevenue: 0,
        totalRevenue: 0,
        totalSales: 0,
      };
    }

    const earliestDate = rangeStart
      ? new Date(rangeStart)
      : timeFiltered.reduce((min, item) => {
          const d = new Date(item.updatedAt);
          return d < min ? d : min;
        }, new Date(timeFiltered[0].updatedAt));

    const buckets = createMonthlyBuckets(earliestDate, now);
    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    for (const item of timeFiltered) {
      const date = new Date(item.updatedAt);
      if (Number.isNaN(date.getTime())) continue;

      const key = getMonthKey(date);
      const bucket = bucketMap.get(key);
      if (!bucket) continue;

      bucket.revenue += Number(item.price) || 0;
      bucket.salesCount += 1;
    }

    const maxRevenue = buckets.reduce((max, bucket) => Math.max(max, bucket.revenue), 0);
    const totalRevenue = buckets.reduce((sum, bucket) => sum + bucket.revenue, 0);
    const totalSales = buckets.reduce((sum, bucket) => sum + bucket.salesCount, 0);

    return {
      buckets,
      maxRevenue,
      totalRevenue,
      totalSales,
    };
  }, [history, chartCrop, chartSourceType, chartTimeRange]);

  const areaChart = useMemo(() => {
    if (chartData.buckets.length === 0) {
      return null;
    }

    const width = 860;
    const height = 260;
    const padding = { top: 14, right: 18, bottom: 38, left: 54 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const baselineY = padding.top + innerHeight;
    const maxRevenue = Math.max(chartData.maxRevenue, 1);

    const points = chartData.buckets.map((bucket, index) => {
      const x =
        chartData.buckets.length === 1
          ? padding.left + innerWidth / 2
          : padding.left + (index / (chartData.buckets.length - 1)) * innerWidth;
      const y = baselineY - (bucket.revenue / maxRevenue) * innerHeight;
      return {
        x,
        y,
        revenue: bucket.revenue,
        salesCount: bucket.salesCount,
        label: bucket.label,
      };
    });

    const yTicks = 4;
    const yAxis = Array.from({ length: yTicks + 1 }, (_, index) => {
      const ratio = index / yTicks;
      const value = maxRevenue - ratio * maxRevenue;
      const y = padding.top + ratio * innerHeight;
      return { value, y };
    });

    const xLabels = points.filter((_, index) => {
      if (points.length <= 6) return true;
      const step = Math.ceil(points.length / 6);
      return index % step === 0 || index === points.length - 1;
    });

    return {
      width,
      height,
      baselineY,
      points,
      yAxis,
      xLabels,
      areaPath: buildAreaPath(points, baselineY),
      linePath: `M ${points.map((point) => `${point.x},${point.y}`).join(' L ')}`,
    };
  }, [chartData]);

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

  const removeHistoryRecord = async (id) => {
    toast('Delete this history record?', {
      description: 'This action cannot be undone.',
      style: {
        border: '1px solid #20a46b',
      },
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await productApi.removeHistory(id);
            await loadHistory();
            toast.success('History record deleted.');
          } catch {
            toast.error('Could not delete history record. Try again.');
          }
        },
      },
      actionButtonStyle: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
      },
      cancel: {
        label: 'Cancel',
      },
      duration: Infinity,
    });
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
                            {resolveCreatedLocation(item)}
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
                              <Link
                                to={`/products/${item._id}`}
                                className="font-semibold text-[#20a46b] hover:underline"
                              >
                                View Details
                              </Link>
                              <button
                                type="button"
                                className="font-semibold text-red-600 hover:underline"
                                onClick={() => removeHistoryRecord(item._id)}
                              >
                                Delete History
                              </button>
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
              <div className="flex gap-3 flex-wrap justify-end">
                <select
                  value={chartCrop}
                  onChange={(event) => setChartCrop(event.target.value)}
                  className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:border-[#20a46b]"
                  aria-label="Filter chart by crop"
                >
                  <option value="all">All Crops</option>
                  {uniqueCrops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>

                <select
                  value={chartSourceType}
                  onChange={(event) => setChartSourceType(event.target.value)}
                  className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:border-[#20a46b]"
                  aria-label="Filter chart by source type"
                >
                  <option value="all">All Source Types</option>
                  {sourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type[0].toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={chartTimeRange}
                  onChange={(event) => setChartTimeRange(event.target.value)}
                  className="rounded-lg border border-[#d8ddda] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:border-[#20a46b]"
                  aria-label="Filter chart by time range"
                >
                  {chartRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {areaChart ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] px-3 py-2">
                    <p className="text-xs font-semibold text-[#666]">Sales (records)</p>
                    <p className="text-lg font-black text-[#1f1f1f]">{chartData.totalSales}</p>
                  </div>
                  <div className="rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] px-3 py-2">
                    <p className="text-xs font-semibold text-[#666]">Revenue</p>
                    <p className="text-lg font-black text-[#1f1f1f]">{formatCurrency(chartData.totalRevenue)}</p>
                  </div>
                  <div className="rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] px-3 py-2">
                    <p className="text-xs font-semibold text-[#666]">Peak month revenue</p>
                    <p className="text-lg font-black text-[#1f1f1f]">{formatCurrency(chartData.maxRevenue)}</p>
                  </div>
                </div>

                <div className="h-64 rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] p-2">
                  <svg
                    viewBox={`0 0 ${areaChart.width} ${areaChart.height}`}
                    className="h-full w-full"
                    role="img"
                    aria-label="Sales and revenue area chart"
                  >
                    {areaChart.yAxis.map((tick) => (
                      <g key={tick.y}>
                        <line
                          x1="54"
                          y1={tick.y}
                          x2={areaChart.width - 18}
                          y2={tick.y}
                          stroke="#e3e8e5"
                          strokeWidth="1"
                        />
                        <text
                          x="46"
                          y={tick.y + 4}
                          textAnchor="end"
                          fontSize="11"
                          fill="#6b7280"
                        >
                          {formatCurrency(tick.value)}
                        </text>
                      </g>
                    ))}

                    <path d={areaChart.areaPath} fill="#6bcf9c" fillOpacity="0.25" />
                    <path d={areaChart.linePath} fill="none" stroke="#20a46b" strokeWidth="2.5" />

                    {areaChart.points.map((point) => (
                      <g key={`${point.label}-${point.x}`}>
                        <circle cx={point.x} cy={point.y} r="3.5" fill="#20a46b" />
                        <title>{`${point.label}: ${formatCurrency(point.revenue)} from ${point.salesCount} sale(s)`}</title>
                      </g>
                    ))}

                    {areaChart.xLabels.map((label) => (
                      <text
                        key={`${label.label}-${label.x}`}
                        x={label.x}
                        y={areaChart.baselineY + 20}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#6b7280"
                      >
                        {label.label}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="h-64 rounded-lg border border-[#e0e5e1] bg-[#f9fbfa] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-[#999]">No sold records found for selected filters</p>
                  <p className="text-xs text-[#bbb]">Try changing crop, source type, or time range</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
