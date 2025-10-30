import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader, AlertTriangle, Download, Printer, Mail } from 'lucide-react';
import privateApi from '@/lib/http';

interface OrderDetailsPageProps {
  customerId?: string;
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  customerId: propCustomerId,
}) => {
  const params = useParams<{ customerId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const query = new URLSearchParams(location.search);
  const queryCustomerId = query.get('customerId') || undefined;
  const effectiveCustomerId =
    propCustomerId ?? params.customerId ?? queryCustomerId;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await privateApi.get(
          `/admin/${effectiveCustomerId}/orders`
        );
        const list = res?.data?.data ?? res?.data ?? [];
        setOrders(Array.isArray(list) ? list : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [effectiveCustomerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-gray-600" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={36} />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {/* <h2 className="text-xl font-semibold mb-6">
          Orders{' '}
          {effectiveCustomerId ? `for Customer ${effectiveCustomerId}` : ''}
        </h2> */}

        {orders.length === 0 ? (
          <div className="text-gray-600 text-center py-8">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="p-3 font-medium">Sr No.</th>
                  <th className="p-3 font-medium">Order ID</th>
                  <th className="p-3 font-medium">Order Details</th>
                  <th className="p-3 font-medium">Payment Details</th>
                  <th className="p-3 font-medium">Order Status</th>
                  <th className="p-3 font-medium">Order Date</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-b hover:bg-gray-50 transition`}
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 text-primary font-medium">
                      {order.shopify_order_name || order.shopify_order_number}
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {order.meta?.items?.map((item: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 text-gray-700"
                          >
                            <span className="font-medium">{item?.title}</span>
                            <span className="text-gray-500 text-xs">
                              · {item?.variant_title}
                            </span>
                            <span className="text-gray-500 text-xs">
                              · {item?.quantity} qty
                            </span>
                          </div>
                        ))}
                        {order.meta?.lead_converted_by && (
                          <p className="text-xs text-gray-500">
                            Lead Converted by:{' '}
                            <span className="text-gray-700 font-medium">
                              {order.meta.lead_converted_by}
                            </span>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-gray-700">
                      {/* <div className="font-medium">Razorpay</div> */}
                      <div className="text-xs text-gray-500">
                        {order.payments?.[0]?.payment_method || '—'}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status === 'delivered'
                          ? 'Delivered'
                          : order.status === 'pending'
                          ? 'Pending Delivery'
                          : order.status || 'Unknown'}
                      </span>
                    </td>

                    <td className="p-3 text-gray-700">
                      {new Date(order.shopify_created_at).toLocaleString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}{' '}
                      <div className="text-xs text-gray-500">
                        {new Date(order.shopify_created_at).getFullYear()}
                      </div>
                    </td>

                    <td className="p-3 flex items-center gap-3 text-gray-500">
                      <Printer className="w-4 h-4 cursor-pointer hover:text-gray-700" />
                      <Download className="w-4 h-4 cursor-pointer hover:text-gray-700" />
                      <Mail className="w-4 h-4 cursor-pointer hover:text-gray-700" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
