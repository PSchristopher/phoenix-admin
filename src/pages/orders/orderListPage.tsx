import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  MoreVertical,
  Check,
  Package,
  FileText,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import privateApi from '@/lib/http'; // or your axios instance
import { useNavigate } from 'react-router-dom';
import { webRoutes } from '@/routes/web';

interface Order {
  id: string;
  display_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  currency: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  created_at: string;
  updated_at: string;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

interface Stats {
  total: number;
  completed: number;
  cancelled: number;
  returned: number;
}

const OrderListPage = () => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    cancelled: 0,
    returned: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });
  const navigate = useNavigate();

  // Fetch orders from backend
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('perPage', pagination.perPage.toString());

      const response = await privateApi.get<OrdersResponse>(
        `/admin/orders?${params.toString()}`
      );
      console.log('Fetched orders response:', response.data);
      if (response.data) {
        setOrders(response.data.data || []);

        // Calculate stats from the data
        const ordersData = response.data.data || [];
        const calculatedStats = {
          total: ordersData.length,
          completed: ordersData.filter((order) => order.status === 'delivered')
            .length,
          cancelled: ordersData.filter((order) => order.status === 'cancelled')
            .length,
          returned: ordersData.filter((order) => order.status === 'returned')
            .length,
        };
        setStats(calculatedStats);

        // Update pagination if available from API
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        } else {
          setPagination((prev) => ({
            ...prev,
            page,
            total: ordersData.length,
            totalPages: Math.ceil(ordersData.length / prev.perPage),
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const statsData = [
    {
      label: 'Total Orders',
      value: stats.total.toString(),
      subtext: 'All time orders',
      bg: 'bg-purple-100',
      icon: Package,
    },
    {
      label: 'Completed',
      value: stats.completed.toString(),
      subtext: 'Delivered orders',
      bg: 'bg-blue-100',
      icon: CheckCircle,
    },
    {
      label: 'Canceled',
      value: stats.cancelled.toString(),
      subtext: 'Cancelled orders',
      bg: 'bg-red-100',
      icon: FileText,
    },
    {
      label: 'Return',
      value: stats.returned.toString(),
      subtext: 'Returned orders',
      bg: 'bg-gray-100',
      icon: RotateCcw,
    },
  ];

  const tabs = [
    {
      label: 'All Status',
      value: 'all',
      count: stats.total,
      active: statusFilter === 'all',
    },
    {
      label: 'Shipped',
      value: 'shipped',
      count: orders.filter((o) => o.status === 'shipped').length,
      active: statusFilter === 'shipped',
    },
    {
      label: 'Completed',
      value: 'delivered',
      count: stats.completed,
      active: statusFilter === 'delivered',
    },
    {
      label: 'Canceled',
      value: 'cancelled',
      count: stats.cancelled,
      active: statusFilter === 'cancelled',
    },
    {
      label: 'Return',
      value: 'returned',
      count: stats.returned,
      active: statusFilter === 'returned',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      delivered: 'bg-green-500 text-white',
      shipped: 'bg-blue-500 text-white',
      cancelled: 'bg-red-500 text-white',
      returned: 'bg-gray-400 text-white',
      confirmed: 'bg-yellow-500 text-white',
      pending: 'bg-orange-500 text-white',
    };
    return colors[status] || 'bg-gray-400 text-white';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      delivered: 'Completed',
      shipped: 'Shipped',
      cancelled: 'Canceled',
      returned: 'Return',
      confirmed: 'Confirmed',
      pending: 'Pending',
    };
    return statusMap[status] || status;
  };

  const getPaymentBadge = (paymentStatus: string) => {
    if (paymentStatus === 'paid') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Paid</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-yellow-600">
        <div className="w-4 h-4 rounded-full border-2 border-yellow-600 flex items-center justify-center">
          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
        </div>
        <span className="text-sm font-medium">Pending</span>
      </div>
    );
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleTabClick = (tabValue: string) => {
    setStatusFilter(tabValue);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchOrders(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your Orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} rounded-lg p-5 flex items-start justify-between`}
          >
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-xs text-gray-600">{stat.subtext}</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <stat.icon className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="bg-white rounded-t-lg border border-gray-200 p-4 pb-6">
          {/* Tabs Section */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1 w-1/2">
            <button
              onClick={() => handleTabClick('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 flex-1 ${
                statusFilter === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Status ({stats.total})
            </button>
            <button
              onClick={() => handleTabClick('shipped')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 flex-1 ${
                statusFilter === 'shipped'
                  ? 'bg-blue-100 text-blue-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Shipped ({orders.filter((o) => o.status === 'shipped').length})
            </button>
            <button
              onClick={() => handleTabClick('delivered')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 flex-1 ${
                statusFilter === 'delivered'
                  ? 'bg-green-100 text-green-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => handleTabClick('cancelled')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 flex-1 ${
                statusFilter === 'cancelled'
                  ? 'bg-red-100 text-red-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Canceled ({stats.cancelled})
            </button>
            <button
              onClick={() => handleTabClick('returned')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 flex-1 ${
                statusFilter === 'returned'
                  ? 'bg-gray-200 text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Return ({stats.returned})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or product"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Today</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={
                      selectedOrders.length === orders.length &&
                      orders.length > 0
                    }
                    onChange={() => {
                      if (selectedOrders.length === orders.length) {
                        setSelectedOrders([]);
                      } else {
                        setSelectedOrders(orders.map((order) => order.id));
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Order ID <ChevronDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Product Name <ChevronDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date <ChevronDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Customer Name <ChevronDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total <ChevronDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Payment Status <ChevronDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Order Status <ChevronDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                    />
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-medium text-gray-900 hover:text-primary hover:underline"
                    onClick={() => navigate(`${webRoutes.order}/${order.id}`)}
                  >
                    {order.display_id || order.shopify_order_name || order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.meta.line_items?.[0]?.name || 'N/A'}
                    {order.meta.line_items &&
                      order.meta.line_items.length > 1 && (
                        <span className="text-gray-500 ml-1">
                          +{order.meta.line_items.length - 1} more
                        </span>
                      )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.customer.first_name} {order.customer.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(order.total_price, order.currency)}
                  </td>
                  <td className="px-6 py-4">
                    {getPaymentBadge(order.payment_status)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.perPage + 1} to{' '}
              {Math.min(pagination.page * pagination.perPage, pagination.total)}{' '}
              of {pagination.total} items
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 rounded ${
                        pageNum === pagination.page
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
              {pagination.totalPages > 5 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    onClick={() => handlePageChange(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
              <button
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {pagination.perPage} / page
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderListPage;
