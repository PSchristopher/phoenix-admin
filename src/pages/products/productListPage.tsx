import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { webRoutes } from '@/routes/web';
import {
  Download,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import privateApi from '@/lib/http';
import { TbDotsVertical } from 'react-icons/tb';
interface Filters {
  status: string;
  stock: string;
  category: string;
  price_min: string;
  price_max: string;
  date_from: string;
  date_to: string;
}

const ProductListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    perPage: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<Filters>({
    status: '',
    stock: '',
    category: '',
    price_min: '',
    price_max: '',
    date_from: '',
    date_to: '',
  });

  // Fetch products from API
  const fetchProducts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        // Add search term
        if (searchTerm) params.append('search', searchTerm);

        // Add all filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        // Add pagination
        params.append('page', page.toString());
        params.append('perPage', pagination.perPage.toString());

        const response = await privateApi.get(
          `/admin/products?${params.toString()}`
        );

        console.log(response.data, 'jhddjdjjdj');
        if (response.status === 200) {
          setProducts(response.data.data || []);
          setPagination(
            response.data.pagination || {
              total: response.data.total || 0,
              page: page,
              perPage: pagination.perPage,
              totalPages: Math.ceil(
                (response.data.total || 0) / pagination.perPage
              ),
            }
          );
        }
      } catch (err) {
        setError('Failed to fetch products. Please try again.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filters, pagination.perPage]
  );

  // Search and filter with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 500); // Increased debounce time for better performance

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filter changes
  };
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setProducts(products.map((p) => ({ ...p, selected: checked })));
  };

  const handleSelectProduct = (productId, checked) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, selected: checked } : p
      )
    );
    setSelectAll(false);
  };

  const handleBulkAction = async (action) => {
    if (!action) return;

    try {
      const selectedProducts = products.filter((product) => product.selected);
      if (selectedProducts.length === 0) {
        alert('Please select products first');
        return;
      }

      const productIds = selectedProducts.map((product) => product.id);

      switch (action) {
        case 'delete':
          if (window.confirm(`Delete ${selectedProducts.length} product(s)?`)) {
            await privateApi.delete('/admin/products/bulk', {
              data: { productIds },
            });
            alert('Products deleted successfully');
          }
          break;
        case 'approve':
          await privateApi.put('/admin/products/bulk/status', {
            productIds,
            status: 'approved',
          });
          alert('Products approved successfully');
          break;
        default:
          break;
      }

      fetchProducts();
    } catch (err) {
      setError('Failed to perform bulk action');
      console.error('Bulk action error:', err);
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 text-sm font-medium">
          <CheckCircle size={14} />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 text-sm font-medium">
        <Clock size={14} />
        Draft
      </span>
    );
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
  const getStockBadge = (stock) => {
    const normalizedStock = stock?.toLowerCase();

    if (normalizedStock === 'in stock' || normalizedStock === 'in_stock') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 text-sm font-medium">
          <CheckCircle size={14} />
          In Stock
        </span>
      );
    }
    if (normalizedStock === 'low stock' || normalizedStock === 'low_stock') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-yellow-50 text-yellow-700 text-sm font-medium">
          <AlertTriangle size={14} />
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-700 text-sm font-medium">
        <XCircle size={14} />
        Out of Stock
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹0.00';
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchProducts(newPage);
  };

  const renderPaginationButtons = () => {
    const { page: currentPage, totalPages } = pagination;

    if (totalPages <= 1) return null;

    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    console.log(endPage, startPage, maxVisiblePages, 'fkkdkdk');
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border-0 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
    );

    // First page + ellipsis
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg text-sm font-medium  transition-colors ${
            currentPage === i
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-700 border-0 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page + ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border-0 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    );

    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        {buttons}
      </div>
    );
  };

  const getProductImage = (product) => {
    if (product.images) {
      return (
        <img
          src={product.images[0].image_url}
          alt={product.product_name}
          className="w-10 h-10 rounded-lg object-cover"
        />
      );
    }

    if (product.icon) {
      return (
        <div
          className={`w-10 h-10 ${
            product.iconBg || 'bg-gray-100'
          } rounded-lg flex items-center justify-center text-xl`}
        >
          {product.icon}
        </div>
      );
    }

    return (
      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium">
        IMG
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            className="animate-spin mx-auto mb-4 text-gray-600"
            size={32}
          />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={32} />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Products</h1>
          <p className="text-sm text-gray-500">Manage your product inventory</p>
        </div>

        <div className="bg-white rounded-t-lg border border-gray-200 p-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex bg-blue border-md border-blue  rounded-lg p-2 gap-4 w-1/3">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 w-1/4 ${
                  filters.status === ''
                    ? 'bg-primary text-white shadow-sm'
                    : ' hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 w-1/4 ${
                  filters.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 shadow-sm'
                    : ' hover:text-gray-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusFilter('approved')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 w-1/4 ${
                  filters.status === 'approved'
                    ? 'bg-green-100 text-green-800 shadow-sm'
                    : ' hover:text-gray-900'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => handleStatusFilter('rejected')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border-0 w-1/4 ${
                  filters.status === 'rejected'
                    ? 'bg-red-100 text-red-800 shadow-sm'
                    : ' hover:text-gray-900'
                }`}
              >
                Rejected
              </button>
              {/* <button
      onClick={() => handleStatusFilter('draft')}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        filters.status === 'draft'
          ? 'bg-gray-200 text-gray-800 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      Draft
    </button> */}
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium">
                <Download size={16} />
                Bulk Actions
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium">
                <Filter size={16} />
                Advanced Filters
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-64 pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <Search
                  className="absolute right-3 top-2.5 text-gray-400"
                  size={16}
                />
              </div>
              <button
                onClick={() => fetchProducts()}
                className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th> */}
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      {/* <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={product.selected || false}
                          onChange={(e) =>
                            handleSelectProduct(product.id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </td> */}
                      {/* <td className="px-4 py-4">
                        <p
                          onClick={() =>
                            navigate(`${webRoutes.products}/${product.id}`)
                          }
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          {product.id}
                        </p>
                      </td> */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {getProductImage(product)}
                          <p
                            onClick={() =>
                              navigate(`${webRoutes.products}/${product.id}`)
                            }
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                          >
                            {product.product_name || product.title || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {formatPrice(product.price_cents)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {product.brand || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {product.sku || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(product.createdAt || product.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md  text-sm font-medium ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {getStockBadge(product.stock || product.stockStatus)}
                      </td>
                      <td className="px-4 py-4">
                        <button className="p-1 border-0 bg-transparent ">
                          <TbDotsVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

export default ProductListPage;
