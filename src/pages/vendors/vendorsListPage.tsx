import React, { useEffect, useState } from 'react';
import {
  Filter,
  RefreshCw,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlusCircleIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import privateApi from '@/lib/http';
import dayjs from 'dayjs';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { webRoutes } from '@/routes/web';

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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Vendor[];
  pagination: PaginationInfo;
}

const VendorList: React.FC = () => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Summary Stats - you might want to create a separate endpoint for this
  const stats = {
    pending: vendors.filter((v) => v.verification_status === 'pending').length,
    approved: vendors.filter((v) => v.verification_status === 'approved')
      .length,
    submitted: vendors.filter((v) => v.verification_status === 'submitted')
      .length,
  };

  // Fetch vendors from backend with pagination and search
  const fetchVendors = async (
    page: number = currentPage,
    search: string = searchTerm
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: itemsPerPage,
      };

      if (search) {
        params.search = search;
      }

      const response = await privateApi.get<ApiResponse>('/admin/vendors', {
        params,
      });

      if (response.data?.success) {
        setVendors(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(1);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendors(1, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchVendors(page, searchTerm);
  };

  // Handle search input change
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (pagination?.hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchVendors(nextPage, searchTerm);
    }
  };

  const goToPreviousPage = () => {
    if (pagination?.hasPrevPage) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchVendors(prevPage, searchTerm);
    }
  };

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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];

    const pages = [];
    const maxVisiblePages = 5;
    const { currentPage, totalPages } = pagination;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
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
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button
              type="primary"
              onClick={() => fetchVendors(currentPage, searchTerm)}
              className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Vendor Name
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contact
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Main Contact
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
                    {searchTerm
                      ? 'No vendors match your search'
                      : 'No vendors found'}
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 ">
                      <p
                        onClick={() => navigate(`${webRoutes.vendor}/${v.id}`)}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        {v.company_name}
                      </p>
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700">
                      {v.gst_number ? v.gst_number : v.business_type}
                    </td> */}
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={!pagination.hasPrevPage}
                  className={`p-2 rounded-lg border ${
                    !pagination.hasPrevPage
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={!pagination.hasNextPage}
                  className={`p-2 rounded-lg border ${
                    !pagination.hasNextPage
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorList;
