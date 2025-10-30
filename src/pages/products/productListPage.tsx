import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import privateApi from '@/lib/http';
import { TbDotsVertical } from 'react-icons/tb';

const ProductListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    perPage: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    status: '',
    stock: '',
  });

  // Fetch products from API
  const fetchProducts = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status) params.append('status', filters.status);
      if (filters.stock) params.append('stock', filters.stock);
      params.append('page', page);
      params.append('perPage', pagination.perPage);

      const response = await privateApi.get(
        `/admin/products?${params.toString()}`
      );

      setProducts(response.data.data || []);
      setPagination(
        response.data.pagination || {
          total: response.data.data?.length || 0,
          page: page,
          perPage: 10,
          totalPages: Math.ceil((response.data.data?.length || 0) / 10),
        }
      );
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchProducts(newPage);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2  rounded-lg  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>
    );

    if (totalPages > 0) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentPage === 1
              ? 'bg-white text-primary'
              : 'border border-primary bg-white text-primary '
          }`}
        >
          1
        </button>
      );
    }

    if (currentPage > 3) {
      buttons.push(
        <span key="dots1" className="px-2">
          ...
        </span>
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentPage === i
              ? 'bg-white text-primary'
              : 'border border-primary bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="dots2" className="px-2">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentPage === totalPages
              ? 'bg-white text-primary'
              : 'border border-primary bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    );

    return buttons;
  };

  const getProductImage = (product) => {
    if (product.image || product.imageUrl || product.thumbnail) {
      return (
        <img
          src={product.image || product.imageUrl || product.thumbnail}
          alt={product.name}
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

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
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

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
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
                      <td className="px-4 py-4">
                        <p
                          onClick={() =>
                            navigate(`${webRoutes.products}/${product.id}`)
                          }
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          {product.id}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {getProductImage(product)}
                          <p
                            onClick={() =>
                              navigate(`${webRoutes.products}/${product.id}`)
                            }
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                          >
                            {product.name || product.title || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {formatPrice(product.price)}
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
                        {getStatusBadge(product.status)}
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

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total {pagination.total} items
          </div>
          <div className="flex items-center gap-2">
            {renderPaginationButtons()}
            <select
              value={pagination.perPage}
              onChange={(e) => {
                setPagination((prev) => ({
                  ...prev,
                  perPage: Number(e.target.value),
                }));
                fetchProducts(1);
              }}
              className="ml-4 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
