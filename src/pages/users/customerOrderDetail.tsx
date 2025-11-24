import React, { useState } from 'react';
import { Download, Mail, Package } from 'lucide-react';

interface OrderItem {
  name: string;
  title?: string;
  variant_title?: string;
  quantity: number;
  price?: string;
}

interface Order {
  id: string;
  shopify_order_id: string;
  shopify_order_name: string;
  shopify_order_number?: string;
  status: string;
  financial_status: string;
  fulfillment_status?: string | null;
  created_at: string;
  total_price: string;
  currency: string;
  meta: {
    line_items: OrderItem[];
    payment_gateway_names?: string[];
    source_name?: string;
    financial_status?: string;
    name?: string;
    order_number?: number;
  };
  payment_gateway_names?: string[];
}

interface CustomerOrdersPageProps {
  orders: Order[];
  customerId?: string;
}

const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({
  orders,
  customerId,
}) => {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'delivered':
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Pending Delivery';
      case 'pending':
        return 'Pending Payment';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: string, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const getPaymentMethod = (order: Order) => {
    const gatewayNames =
      order.payment_gateway_names || order.meta?.payment_gateway_names;
    if (gatewayNames && gatewayNames.length > 0) {
      return gatewayNames[0].charAt(0).toUpperCase() + gatewayNames[0].slice(1);
    }
    return 'Manual';
  };

  const getLeadSource = (order: Order) => {
    if (order.meta?.source_name) {
      const source = order.meta.source_name
        .replace('shopify_', '')
        .replace(/_/g, ' ');
      return source.charAt(0).toUpperCase() + source.slice(1);
    }
    return 'Online Store';
  };

  const getOrderItems = (order: Order): OrderItem[] => {
    return order.meta?.line_items || [];
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-gray-400 text-lg mb-4">No orders found</div>
        <div className="text-gray-500">
          This customer hasn't placed any orders yet.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Order History ({orders.length})
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedOrders.size === orders.length && orders.length > 0
                  }
                  onChange={toggleAllOrders}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sr No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, index) => {
              const orderItems = getOrderItems(order);
              const paymentMethod = getPaymentMethod(order);
              const leadSource = getLeadSource(order);
              const displayStatus = order.status || order.financial_status;

              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {order.shopify_order_name ||
                        order.meta?.name ||
                        `#${order.meta?.order_number}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      #{order.shopify_order_id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {orderItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-2">
                          <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">
                              {item.title || item.name}
                            </div>
                            {item.variant_title && (
                              <div className="text-gray-600">
                                {item.variant_title}
                              </div>
                            )}
                            <div className="text-gray-500 text-xs">
                              {item.quantity} qty
                              {item.price &&
                                ` · ${formatCurrency(
                                  item.price,
                                  order.currency
                                )}`}
                            </div>
                          </div>
                        </div>
                      ))}
                      {orderItems.length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                          No items available
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {paymentMethod}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {order.shopify_order_id}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          order.financial_status === 'paid'
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {order.financial_status === 'paid' ? 'Paid' : 'Pending'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        displayStatus
                      )}`}
                    >
                      {getStatusLabel(displayStatus)}
                    </span>
                    {order.fulfillment_status && (
                      <div className="text-xs text-gray-500 mt-1">
                        Fulfillment: {order.fulfillment_status}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.created_at)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).getFullYear()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Print"
                      >
                        <Package className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Email"
                      >
                        <Mail className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''}{' '}
              selected
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Bulk Print
              </button>
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Bulk Download
              </button>
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Bulk Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
