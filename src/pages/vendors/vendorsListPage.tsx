import React, { useEffect, useState } from 'react';
import {
  Filter,
  RefreshCw,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlusCircleIcon,
} from 'lucide-react';
import privateApi from '@/lib/http'; // or use your axios instance
import dayjs from 'dayjs';
import { Button } from 'antd';

interface Vendor {
  id: string;
  vendor_id: string;
  company_name: string;
  gst_number?: string | null;
  business_type: string;
  verification_status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'submitted'
    | string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
    phone_number: string;
  };
  categories: {
    category_name: string;
  }[];
}

const VendorList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  // Summary Stats
  const stats = {
    pending: vendors.filter((v) => v.verification_status === 'pending').length,
    approved: vendors.filter((v) => v.verification_status === 'approved')
      .length,
    submitted: vendors.filter((v) => v.verification_status === 'submitted')
      .length,
  };

  // Fetch vendors from backend
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await privateApi.get('/admin/vendors'); // adjust API endpoint as per your backend
      if (response.data?.success && Array.isArray(response.data.data)) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'submitted':
        return 'Submitted';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 bg-white p-6 rounded-xl shadow">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Vendor Application Queue
            </h1>
            <p className="text-gray-500 text-sm">
              Manage vendor applications and compliance status
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* <button
              onClick={fetchVendors}
              className="flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button> */}

            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-sm text-primary mb-1 border-[2px] bg-gray-200 rounded p-2 border-black px-4">
                  TOTAL PENDING
                </div>
                <div className="text-xl font-semibold text-yellow-600">
                  {stats.pending}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-primary mb-1 border-1 bg-gray-200 rounded p-2 border-black px-4">
                  APPROVED
                </div>
                <div className="text-2xl font-semibold text-green-600">
                  {stats.approved}
                </div>
              </div>
              {/* <div className="text-center border-1 border-gray-300 px-4">
                <div className="text-sm text-gray-600 mb-1">SUBMITTED</div>
                <div className="text-2xl font-semibold text-blue-600">
                  {stats.submitted}
                </div>
              </div> */}
              <Button type="primary">
                <PlusCircleIcon />
                Onboard Manually
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="flex gap-4 p-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by company name or GSTIN or contact"
                className="w-1/3 px-3 py-2 p-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                // onChange={(e) => handleSearch(e.target.value)} // Add your search handler
              />
            </div>
            <Button
              type="primary"
              onClick={fetchVendors}
              className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  GST / Business Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Date
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    Loading vendor data...
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {v.company_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {v.gst_number ? v.gst_number : v.business_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{v.user.full_name}</div>
                      <div className="text-gray-500 text-xs">
                        {v.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {v.categories.length > 0
                        ? v.categories.map((c) => c.category_name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          v.verification_status
                        )}`}
                      >
                        {getStatusIcon(v.verification_status)}
                        {getStatusText(v.verification_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {dayjs(v.created_at).format('DD MMM YYYY')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorList;
