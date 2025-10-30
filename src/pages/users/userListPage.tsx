import React, { useState, useEffect } from 'react';
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
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { webRoutes } from '@/routes/web';
import privateApi from '@/lib/http';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
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
    role: '',
  });
  const navigate = useNavigate();

  const goToUser = (id: string | number) => {
    if (!id) return;
    navigate(`${webRoutes.users}/${id}`);
  };

  // Fetch users from API
  const fetchUsers = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      params.append('page', page);
      params.append('perPage', pagination.perPage);

      const response = await privateApi.get(`/user?${params.toString()}`);

      setUsers(response.data.data || []);
      setPagination(
        response.data.pagination || {
          total: response.data.data?.length || 0,
          page: page,
          perPage: 10,
          totalPages: Math.ceil((response.data.data?.length || 0) / 10),
        }
      );
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
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
    setUsers(users.map((u) => ({ ...u, selected: checked })));
  };

  const handleSelectUser = (userId, checked) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, selected: checked } : u))
    );
    setSelectAll(false);
  };

  const handleBulkAction = async (action) => {
    if (!action) return;

    try {
      const selectedUsers = users.filter((user) => user.selected);
      if (selectedUsers.length === 0) {
        alert('Please select users first');
        return;
      }

      const userIds = selectedUsers.map((user) => user.id);

      switch (action) {
        case 'delete':
          if (window.confirm(`Delete ${selectedUsers.length} user(s)?`)) {
            await privateApi.delete('/admin/users/bulk', {
              data: { userIds },
            });
            alert('Users deleted successfully');
          }
          break;
        case 'activate':
          await privateApi.put('/admin/users/bulk/status', {
            userIds,
            status: 'active',
          });
          alert('Users activated successfully');
          break;
        case 'deactivate':
          await privateApi.put('/admin/users/bulk/status', {
            userIds,
            status: 'inactive',
          });
          alert('Users deactivated successfully');
          break;
        default:
          break;
      }

      fetchUsers();
    } catch (err) {
      setError('Failed to perform bulk action');
      console.error('Bulk action error:', err);
    }
  };

  const getStatusBadge = (status) => {
    if (status === true) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 text-sm font-medium">
          <CheckCircle size={14} />
          Active
        </span>
      );
    }
    if (status === false) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 text-sm font-medium">
          <Clock size={14} />
          Inactive
        </span>
      );
    }
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 text-sm font-medium">
          <CheckCircle size={14} />
          Active
        </span>
      );
    }
    if (normalizedStatus === 'inactive') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 text-sm font-medium">
          <Clock size={14} />
          Inactive
        </span>
      );
    }
    if (normalizedStatus === 'suspended') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-700 text-sm font-medium">
          <XCircle size={14} />
          Suspended
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 text-sm font-medium">
        <Clock size={14} />
        Pending
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const normalizedRole = role?.toLowerCase();

    if (normalizedRole === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 text-sm font-medium">
          <User size={14} />
          Admin
        </span>
      );
    }
    if (normalizedRole === 'moderator') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
          <User size={14} />
          Moderator
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 text-sm font-medium">
        <User size={14} />
        User
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getUserAvatar = (user) => {
    if (user.avatar || user.avatarUrl || user.profile_picture) {
      return (
        <img
          src={user.avatar || user.avatarUrl || user.profile_picture}
          alt={`${user.first_name} ${user.last_name}`}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
        {(user.first_name?.charAt(0) || '') + (user.last_name?.charAt(0) || '')}
      </div>
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchUsers(newPage);
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
        className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              ? ' text-primary'
              : 'border border-primary bg-white border-2 text-primary hover:bg-primary'
          }`}
        >
          1
        </button>
      );
    }

    if (currentPage > 3) {
      buttons.push(
        <span key="dots1" className="px-2 text-gray-500">
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
              ? 'bg-blue-600 text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="dots2" className="px-2 text-gray-500">
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
              ? 'bg-blue-600 text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            className="animate-spin mx-auto mb-4 text-gray-600"
            size={32}
          />
          <p className="text-gray-600">Loading users...</p>
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
            onClick={() => fetchUsers()}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Users</h1>
          <p className="text-sm text-gray-500">Manage your user accounts</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <select
                onChange={(e) => handleBulkAction(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bulk Actions</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-64 pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search
                  className="absolute right-3 top-2.5 text-gray-400"
                  size={16}
                />
              </div>
              <button
                onClick={() => fetchUsers()}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {/* <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={user.selected || false}
                          onChange={(e) =>
                            handleSelectUser(user.id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </td> */}
                      <td className="px-4 py-4">
                        <p
                          onClick={() => goToUser(user.id)}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          {user.id?.slice(0, 5)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {getUserAvatar(user)}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username || user.email.split('@')[0]}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {user.city || user.country ? (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} />
                            {[user.city, user.country]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(
                          user.created_at || user.createdAt || user.joined_date
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(user.is_active)}
                      </td>
                      <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-4">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical size={16} className="text-gray-600" />
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
            Total {pagination.total} users
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
                fetchUsers(1);
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

export default UserListPage;

// import React, { useState, useEffect } from 'react';
// import {
//   Search,
//   MoreVertical,
//   ChevronLeft,
//   ChevronRight,
//   Loader,
//   AlertTriangle,
//   Filter,
//   Download,
// } from 'lucide-react';
// import privateApi from '@/lib/http';

// const UserListPage = () => {
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [pagination, setPagination] = useState({
//     total: 0,
//     page: 1,
//     perPage: 10,
//     totalPages: 1,
//   });

//   // Fetch customers from API
//   const fetchCustomers = async (page = pagination.page) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const params = new URLSearchParams();
//       if (searchTerm) params.append('search', searchTerm);
//       params.append('page', page);
//       params.append('perPage', pagination.perPage);

//       const response = await privateApi.get(`/user?${params.toString()}`);

//       setCustomers(response.data.data || []);
//       setPagination(
//         response.data.pagination || {
//           total: response.data.data?.length || 0,
//           page: page,
//           perPage: 10,
//           totalPages: Math.ceil((response.data.data?.length || 0) / 10),
//         }
//       );
//     } catch (err) {
//       setError('Failed to fetch customers. Please try again.');
//       console.error('Error fetching customers:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchCustomers(1);
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const getStatusBadge = (status) => {
//     const normalizedStatus = status?.toLowerCase();

//     switch (normalizedStatus) {
//       case 'pending':
//         return (
//           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
//             Pending
//           </span>
//         );
//       case 'delivered':
//         return (
//           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
//             Delivered
//           </span>
//         );
//       case 'shipped':
//         return (
//           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
//             Shipped
//           </span>
//         );
//       case 'cancelled':
//         return (
//           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
//             Cancelled
//           </span>
//         );
//       default:
//         return (
//           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
//             {status || 'Pending'}
//           </span>
//         );
//     }
//   };

//   const getCategoryBadge = (category, subcategory = '') => {
//     const baseClasses =
//       'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium';

//     if (category === 'Electronics') {
//       return (
//         <div className="flex flex-col gap-1">
//           <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
//             Electronics
//           </span>
//           {subcategory && (
//             <span className={`${baseClasses} bg-blue-50 text-blue-600`}>
//               {subcategory}
//             </span>
//           )}
//         </div>
//       );
//     }
//     if (category === 'Hardware') {
//       return (
//         <div className="flex flex-col gap-1">
//           <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
//             Hardware
//           </span>
//         </div>
//       );
//     }
//     if (category === 'Food') {
//       return (
//         <div className="flex flex-col gap-1">
//           <span className={`${baseClasses} bg-green-100 text-green-800`}>
//             Food
//           </span>
//           {subcategory && (
//             <span className={`${baseClasses} bg-green-50 text-green-600`}>
//               {subcategory}
//             </span>
//           )}
//         </div>
//       );
//     }
//     if (category === 'Fashion') {
//       return (
//         <div className="flex flex-col gap-1">
//           <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
//             Fashion
//           </span>
//           {subcategory && (
//             <span className={`${baseClasses} bg-purple-50 text-purple-600`}>
//               {subcategory}
//             </span>
//           )}
//         </div>
//       );
//     }
//     if (category === 'Pharmaceuticals') {
//       return (
//         <div className="flex flex-col gap-1">
//           <span className={`${baseClasses} bg-red-100 text-red-800`}>
//             Pharmaceuticals
//           </span>
//           {subcategory && (
//             <span className={`${baseClasses} bg-red-50 text-red-600`}>
//               {subcategory}
//             </span>
//           )}
//         </div>
//       );
//     }
//     if (category === 'Automotive') {
//       return (
//         <div className="flex flex-col gap-1">
//           <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
//             Automotive
//           </span>
//           {subcategory && (
//             <span className={`${baseClasses} bg-gray-50 text-gray-600`}>
//               {subcategory}
//             </span>
//           )}
//         </div>
//       );
//     }

//     return (
//       <span className={`${baseClasses} bg-gray-100 text-gray-600`}>
//         {category}
//       </span>
//     );
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     return date.toISOString().split('T')[0];
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage < 1 || newPage > pagination.totalPages) return;
//     setPagination((prev) => ({ ...prev, page: newPage }));
//     fetchCustomers(newPage);
//   };

//   const renderPaginationButtons = () => {
//     const buttons = [];
//     const currentPage = pagination.page;
//     const totalPages = pagination.totalPages;

//     // Previous button
//     buttons.push(
//       <button
//         key="prev"
//         onClick={() => handlePageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         <ChevronLeft size={16} />
//       </button>
//     );

//     // Page numbers
//     const visiblePages = [];
//     const showEllipsisStart = currentPage > 3;
//     const showEllipsisEnd = currentPage < totalPages - 2;

//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) {
//         visiblePages.push(i);
//       }
//     } else {
//       if (showEllipsisStart) {
//         visiblePages.push(1);
//         visiblePages.push('...');
//       }

//       const start = Math.max(2, currentPage - 1);
//       const end = Math.min(totalPages - 1, currentPage + 1);

//       for (let i = start; i <= end; i++) {
//         visiblePages.push(i);
//       }

//       if (showEllipsisEnd) {
//         visiblePages.push('...');
//         visiblePages.push(totalPages);
//       }
//     }

//     visiblePages.forEach((page, index) => {
//       if (page === '...') {
//         buttons.push(
//           <span key={`dots-${index}`} className="px-2 text-gray-500">
//             ...
//           </span>
//         );
//       } else {
//         buttons.push(
//           <button
//             key={page}
//             onClick={() => handlePageChange(page)}
//             className={`px-3 py-1 border border-gray-300 rounded text-sm font-medium ${
//               currentPage === page
//                 ? 'bg-blue-600 text-white border-blue-600'
//                 : 'bg-white text-gray-700 hover:bg-gray-50'
//             }`}
//           >
//             {page}
//           </button>
//         );
//       }
//     });

//     // Next button
//     buttons.push(
//       <button
//         key="next"
//         onClick={() => handlePageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         <ChevronRight size={16} />
//       </button>
//     );

//     return buttons;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <Loader
//             className="animate-spin mx-auto mb-4 text-gray-600"
//             size={32}
//           />
//           <p className="text-gray-600">Loading customers...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <AlertTriangle className="mx-auto mb-4 text-red-500" size={32} />
//           <p className="text-red-600 mb-4">{error}</p>
//           <button
//             onClick={() => fetchCustomers()}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Customers</h1>

//           {/* Search Bar */}
//           <div className="relative max-w-md">
//             <Search
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//               size={20}
//             />
//             <input
//               type="text"
//               placeholder="Search by customer name, email, or phone number..."
//               value={searchTerm}
//               onChange={handleSearch}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>

//         {/* Divider */}
//         <div className="border-t border-gray-200 my-6"></div>

//         {/* Table */}
//         <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">
//                     NAME
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">
//                     CONTACT
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">
//                     ORDER ID
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">
//                     LATEST ORDER STATUS
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">
//                     LATEST ORDERED DATE
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">
//                     ACTIONS
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {customers.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan="6"
//                       className="px-6 py-8 text-center text-gray-500"
//                     >
//                       No customers found
//                     </td>
//                   </tr>
//                 ) : (
//                   customers.map((customer) => (
//                     <tr key={customer.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-semibold text-gray-900">
//                           {customer.name}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="space-y-1">
//                           <div className="text-sm text-gray-600">
//                             {customer.email}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {customer.phone}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {getCategoryBadge(
//                           customer.category,
//                           customer.subcategory
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {getStatusBadge(customer.status)}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         {formatDate(customer.order_date)}
//                       </td>
//                       <td className="px-6 py-4">
//                         <button className="p-1 hover:bg-gray-100 rounded text-lg">
//                           ⋮
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Divider */}
//         <div className="border-t border-gray-200 my-6"></div>

//         {/* Footer */}
//         <div className="flex items-center justify-between">
//           <div className="text-sm text-gray-600">
//             Total {pagination.total} items
//           </div>

//           {/* Pagination */}
//           <div className="flex items-center gap-2">
//             {renderPaginationButtons()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserListPage;
