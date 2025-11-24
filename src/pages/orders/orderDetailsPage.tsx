import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import privateApi from '@/lib/http';

interface OrderItem {
  id: string;
  name: string;
  title: string;
  price: string;
  quantity: number;
  vendor: string | null;
  product_id: number;
  variant_id: number;
  sku: string;
  grams: number;
}

interface OrderData {
  id: string;
  vendor_id: string | null;
  customer_id: string | null;
  shopify_order_id: string;
  shopify_order_name: string | null;
  shopify_order_number: string | null;
  contact_email: string | null;
  currency: string;
  financial_status: string | null;
  fulfillment_status: string | null;
  test_order: boolean;
  subtotal_price: string;
  total_price: string;
  total_discount: string;
  total_tax: string;
  total_shipping_price: string;
  total_outstanding: string;
  billing_address: any;
  shipping_address: any;
  meta: any;
  status: string;
  shopify_created_at: string | null;
  shopify_updated_at: string | null;
  created_at: string;
  updated_at: string;
  payments: Array<{
    id: string;
    order_id: string;
    payment_mode: string;
    amount_paid: string;
    balance: string;
    payment_verified: boolean;
    payment_image: string | null;
    remarks: string | null;
    meta: any;
    created_at: string;
    updated_at: string;
  }>;
  vendor: {
    id: string;
    company_name: string;
    business_type: string;
    pan_number: string;
    gst_number: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    documents: Array<any>;
    bank_details: any;
    digital_signature_url: string | null;
    verification_status: string;
    created_at: string;
    updated_at: string;
  } | null;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    avatar: string | null;
    is_active: boolean;
    is_verified: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
  } | null;
}

interface OrderTimeline {
  id: string;
  date: string;
  time: string;
  status: string;
  description: string;
  icon: any;
  color: string;
}

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  // Fetch order details from backend
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await privateApi.get<OrderData>(`/admin/${id}/order`);
      console.log(response.data, 'API Response');

      if (response.data) {
        setOrder(response.data);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Convert API line items to frontend format
  const getOrderItems = (orderData: OrderData) => {
    if (!orderData.meta?.line_items) return [];

    return orderData.meta.line_items.map((item: any, index: number) => ({
      id: item.id?.toString() || `item-${index}`,
      product_name: item.name || item.title,
      product_image: null,
      category: item.vendor || 'General',
      color: null,
      size: null,
      price: parseFloat(item.price) || 0,
      quantity: item.quantity || 1,
      total: (parseFloat(item.price) || 0) * (item.quantity || 1),
    }));
  };

  // Generate timeline from order status and dates
  const generateTimeline = (orderData: OrderData) => {
    const timeline = [];
    const createdDate = new Date(orderData.created_at);

    if (orderData.status === 'delivered') {
      timeline.push({
        id: 'delivered',
        date: createdDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: createdDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Delivered',
        description: 'Package delivered to recipient',
        icon: CheckCircle,
        color: 'blue',
      });
    }

    if (orderData.status === 'shipped' || orderData.status === 'delivered') {
      timeline.push({
        id: 'shipped',
        date: createdDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: createdDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Shipped',
        description: 'Package shipped from warehouse',
        icon: Truck,
        color: orderData.status === 'delivered' ? 'gray' : 'blue',
      });
    }

    timeline.push({
      id: 'confirmed',
      date: createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: createdDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Order Confirmed',
      description: 'Order has been confirmed',
      icon: Package,
      color: 'gray',
    });

    timeline.push({
      id: 'placed',
      date: createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: createdDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Order Placed',
      description: 'Order has been placed successfully',
      icon: Package,
      color: 'gray',
    });

    return timeline;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      delivered: 'bg-green-500 text-white',
      shipped: 'bg-blue-500 text-white',
      cancelled: 'bg-red-500 text-white',
      returned: 'bg-gray-400 text-white',
      confirmed: 'bg-yellow-500 text-white',
      pending: 'bg-orange-500 text-white',
      voided: 'bg-red-500 text-white',
      completed: 'bg-green-500 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400 text-white';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      delivered: 'Delivered',
      shipped: 'Shipped',
      cancelled: 'Cancelled',
      returned: 'Returned',
      confirmed: 'Confirmed',
      pending: 'Pending',
      voided: 'Voided',
      completed: 'Completed',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getPaymentStatusColor = (financialStatus: string) => {
    return financialStatus === 'paid' || financialStatus === 'voided'
      ? 'bg-green-50 text-green-700'
      : 'bg-yellow-50 text-yellow-700';
  };

  const getPaymentStatusText = (financialStatus: string) => {
    return financialStatus === 'paid' || financialStatus === 'voided'
      ? 'Payment Processed'
      : 'Pending Payment';
  };

  const formatCurrency = (amount: string | number, currency = 'INR') => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProductEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      Fashion: '👕',
      Electronics: '📱',
      Home: '🏠',
      Beauty: '💄',
      Sports: '⚽',
      Books: '📚',
      Toys: '🧸',
      General: '📦',
    };
    return emojiMap[category] || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-red-600">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const orderItems = getOrderItems(order);
  const timeline = generateTimeline(order);

  // Calculate totals safely
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const discount = parseFloat(order.total_discount) || 0;
  const shipping = parseFloat(order.total_shipping_price) || 0;
  const total = parseFloat(order.total_price) || subtotal - discount + shipping;

  const customerName = order.customer
    ? `${order.customer.first_name} ${order.customer.last_name}`
    : order.shipping_address?.name || 'Unknown Customer';

  const customerEmail =
    order.customer?.email || order.contact_email || 'No email';
  const customerPhone =
    order.customer?.phone || order.shipping_address?.phone || 'No phone';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-sm text-gray-500 mb-2 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Order List</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        </div>

        {/* Order Info Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-gray-500 text-sm">Order ID: </span>
              <span className="text-primary font-semibold text-lg">
                {order.shopify_order_name || `#${order.id.slice(-8)}`}
              </span>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full ${getPaymentStatusColor(
                order.financial_status || 'pending'
              )}`}
            >
              ⓘ {getPaymentStatusText(order.financial_status || 'pending')}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200">
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200">
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-primary hover:bg-primary-dark rounded-lg">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button className="p-2 bg-primary hover:bg-primary-dark rounded-lg">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          {formatDate(order.created_at)}
        </p>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Order Items</h2>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                      {getProductEmoji(item.category)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-semibold mb-1">
                        {item.product_name}
                      </h3>
                      <div className="flex gap-3 text-sm text-gray-600">
                        <span>SKU: {item.sku || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-2">Price</p>
                      <p className="font-semibold">
                        {formatCurrency(item.price, order.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-2">Qty</p>
                      <p className="font-semibold">{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-2">Total</p>
                      <p className="font-semibold">
                        {formatCurrency(item.total, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub Total</span>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs mb-1">
                        {orderItems.length} Item
                        {orderItems.length !== 1 ? 's' : ''}
                      </p>
                      <span className="font-medium">
                        {formatCurrency(order.subtotal_price, order.currency)}
                      </span>
                    </div>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Discount</span>
                        <p className="text-xs text-gray-400">
                          Promotional discount
                        </p>
                      </div>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(discount, order.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Delivery Fee</span>
                      <p className="text-xs text-gray-400">Shipping charges</p>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(shipping, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-3 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total, order.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Line */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Time Line</h2>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Leave a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="relative">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.color === 'blue'
                            ? 'bg-primary bg-opacity-10'
                            : 'bg-gray-100'
                        }`}
                      >
                        <event.icon
                          className={`w-5 h-5 ${
                            event.color === 'blue'
                              ? 'text-primary'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      {index !== timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">
                          {event.date}
                        </span>
                        <span className="text-xs text-gray-400">
                          {event.time}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {event.status}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-3">Notes</h3>
              <p className="text-sm text-gray-500 mb-4">
                {order.meta?.note || 'Add Notes for this order'}
              </p>
              {!order.meta?.note && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    e.g., Customer requested special packaging for this order.
                  </p>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Customer Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Shipping</h3>
              <div className="text-sm">
                <p className="font-medium mb-2">{customerName}</p>
                <p className="text-gray-600">
                  {order.shipping_address?.address1}
                  <br />
                  {order.shipping_address?.address2 && (
                    <>
                      {order.shipping_address.address2}
                      <br />
                    </>
                  )}
                  {order.shipping_address?.city},{' '}
                  {order.shipping_address?.province}
                  <br />
                  {order.shipping_address?.pincode ||
                    order.shipping_address?.zip}
                  <br />
                  {order.shipping_address?.country}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Payment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">
                    {order.payments?.[0]?.payment_mode || 'Multiple Methods'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium">
                    {order.financial_status || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Paid</span>
                  <span className="font-medium">
                    {formatCurrency(order.total_price, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
