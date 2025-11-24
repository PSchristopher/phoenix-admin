import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import privateApi from '@/lib/http';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { FaPencilAlt } from 'react-icons/fa';
import { IoTicket } from 'react-icons/io5';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import OrderDetailsPage from '../orders/orderDetailsPage';
import CustomerOrdersPage from './customerOrderDetail';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  primaryPhone?: string;
  alternatePhone?: string;
  whatsappAvailable?: boolean;
  deliveryAddress?: string;
  profileImage?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

interface OrderItem {
  name: string;
  color?: string;
  quantity?: number;
  qty?: number;
}

interface PaymentDetails {
  method?: string;
  id?: string;
  type?: string;
}

interface Order {
  id: string;
  orderId: string;
  items?: OrderItem[];
  leadSource?: string;
  payment?: PaymentDetails;
  status?: string;
  date?: string;
}

// ----------------------
// Main Component
// ----------------------
const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // ----------------------
  // Fetch Data
  // ----------------------
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch customer details
        const { data } = await privateApi.get<Customer>(
          `/admin/customer/${id}`
        );
        // const ordersResponse = await privateApi.get<Order[]>(`/api/customers/${id}/orders`);

        setCustomerData(data);
        setCustomerOrders(data?.orders);
        console.log(data, 'customer datatatat');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Order Details',
      children: <CustomerOrdersPage orders={customerOrders} customerId={id} />,
    },
    {
      key: '2',
      label: 'Notes',
      children: 'No notes available',
    },
    {
      key: '3',
      label: 'Activity',
      children: 'No activity available',
    },
  ];

  // ----------------------
  // Render States
  // ----------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="text-lg text-gray-600">Loading customer data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="text-lg text-red-600">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // ----------------------
  // Render Page
  // ----------------------

  console.log('Customer Data:', customerData);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Customer Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <img
                src={
                  customerData?.avatar ||
                  'https://imgs.search.brave.com/EyH1VRfLguRvSG7K-fwOqz_DB_rD1FYN5L2rMk2kSNg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZy/ZWVwaWsuY29tLzI1/Ni8xMTEzNi8xMTEz/NjUwNS5wbmc_c2Vt/dD1haXNfd2hpdGVf/bGFiZWw'
                }
                alt="Customer"
                className="w-20 h-20 rounded-lg object-cover"
              />

              <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {customerData?.first_name} {customerData?.last_name}
                </h1>

                <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                  {/* Primary Phone */}
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Primary Phone</div>
                      <div className="text-sm font-medium text-gray-900">
                        {customerData?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Alternate Phone */}
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">
                        Alternate Phone
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {customerData?.alternatePhone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Email Address</div>
                      <div className="text-sm font-medium text-gray-900">
                        {customerData?.email || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-500">WhatsApp</div>
                      <div
                        className={`text-sm font-medium ${
                          customerData?.whatsappAvailable
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {customerData?.whatsappAvailable
                          ? 'Available'
                          : 'Not Available'}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-3 col-span-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">
                        Delivery Address
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {customerData?.deliveryAddress ||
                          'Address not available'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                // type="primary"
                className="px-4 py-4  rounded-lg text-sm font-medium  flex items-center gap-2"
              >
                <FaPencilAlt />
                Edit Customer Info
              </Button>
              <Button
                type="primary"
                className="px-4 py-4 text-white rounded-lg text-sm font-medium  flex items-center gap-2"
              >
                <IoTicket />
                Create Support Ticket
              </Button>
            </div>
          </div>
        </div>
        <Tabs defaultActiveKey="1" items={items} />
        {/* Tabs + Orders Table */}
      </div>
    </div>
  );
};

export default UserDetailPage;
