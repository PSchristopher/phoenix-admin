import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, message } from 'antd';
import { CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import privateApi from '@/lib/http'; // or use your axios instance
import { useParams } from 'react-router-dom';

interface Document {
  url: string;
  size: number;
  filename: string;
  mimetype: string;
}

interface BankDetails {
  bank_name: string;
  ifsc_code: string;
  branch_name: string;
  account_number: string;
  account_holder_name: string;
  documents: Document[];
}

interface UploadedDocument {
  id: string;
  vendor_id: string;
  document_rule_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  subcategory_name: string;
  created_at: string;
  updated_at: string;
  uploadedDocuments: UploadedDocument[];
}

interface Category {
  id: string;
  vendor_id: string;
  vendor_detail_id: string;
  category_name: string;
  created_at: string;
  updated_at: string;
  subcategories: Subcategory[];
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  is_verified: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

interface VendorData {
  id: string;
  vendor_id: string;
  company_name: string;
  business_type: string;
  pan_number: string | null;
  gst_number: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  documents: Document[];
  bank_details: BankDetails;
  digital_signature_url: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  category_ids: string[] | null;
  categories: Category[];
  user: User;
}

interface ApiResponse {
  success: boolean;
  data: VendorData;
}

const VendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vendorId = id;
  console.log('Vendor ID:', vendorId);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [internalNotes, setInternalNotes] = useState('');

  // Fetch vendor details
  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await privateApi.get<ApiResponse>(
        `/admin/${vendorId}/vendor`
      );
      if (response.data.success) {
        setVendor(response.data.data);

        // Initialize expanded sections for categories
        const sections: Record<string, boolean> = {};
        response.data.data.categories.forEach((category) => {
          sections[category.category_name] = true;
        });
        setExpandedSections(sections);
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      message.error('Failed to fetch vendor details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApprove = async () => {
    try {
      await privateApi.put(`/admin/vendors/${vendorId}/approve`);
      message.success('Vendor approved successfully');
      fetchVendorDetails(); // Refresh data
    } catch (error) {
      console.error('Error approving vendor:', error);
      message.error('Failed to approve vendor');
    }
  };

  const handleReject = async () => {
    try {
      await privateApi.put(`/admin/vendors/${vendorId}/reject`);
      message.success('Vendor rejected successfully');
      fetchVendorDetails(); // Refresh data
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      message.error('Failed to reject vendor');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await privateApi.post(`/admin/vendors/${vendorId}/notes`, {
        notes: internalNotes,
      });
      message.success('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      message.error('Failed to save notes');
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (url: string) => {
    window.open(url, '_blank');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">Loading vendor details...</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-red-600">Vendor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 m-0">
                  Vendor Review: {vendor.company_name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600">
                    Application ID:{' '}
                    <span className="font-medium text-gray-900">
                      {vendor.vendor_id}
                    </span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-600">
                    Submitted:{' '}
                    <span className="font-medium text-gray-900">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </span>
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      vendor.verification_status
                    )} border`}
                  >
                    {getStatusText(vendor.verification_status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleReject}
                className="flex items-center "
              >
                Reject & Send Feedback
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                className="flex items-center "
              >
                Approve Vendor
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Company Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                    {vendor.company_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {vendor.company_name}
                    </h1>
                    <p className="text-gray-500">{vendor.business_type}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Primary Contact Name</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{vendor.user.full_name}</p>
                    {vendor.user.is_verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Email Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{vendor.user.email}</p>
                    {vendor.user.is_verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{vendor.user.phone_number}</p>
                    {vendor.user.is_verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Legal & Business Compliance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">
                Legal & Business Compliance
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Company Name</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{vendor.company_name}</p>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Business Type</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{vendor.business_type}</p>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-1">
                  Official Business Address
                </p>
                <p className="font-medium text-sm">
                  {vendor.address}, {vendor.city}, {vendor.state},{' '}
                  {vendor.pincode}, {vendor.country}
                </p>
              </div>

              {vendor.gst_number && (
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">GSTIN / Tax ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium">{vendor.gst_number}</p>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-gray-500 text-sm mb-2">Uploaded Documents</p>
                <div className="space-y-3">
                  {vendor?.documents?.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded border flex items-center justify-center">
                          📄
                        </div>
                        <span className="text-sm font-medium">
                          {doc.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => handleView(doc.url)}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => handleDownload(doc.url, doc.filename)}
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          Mark Verified
                        </span>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded">
                          Invalid
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Product Categories</h2>

              <div className="flex gap-2 mb-6">
                {vendor?.categories?.map((category) => (
                  <span
                    key={category.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {category.category_name}
                  </span>
                ))}
              </div>

              {/* Category Compliance Sections */}
              {vendor?.categories?.map((category) => (
                <div key={category.id} className="mb-4">
                  <button
                    onClick={() => toggleSection(category.category_name)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <span className="font-semibold">
                      {category.category_name} Compliance
                    </span>
                    {expandedSections[category.category_name] ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {expandedSections[category.category_name] && (
                    <div className="mt-3 space-y-3">
                      {category?.subcategories?.map((subcategory) => (
                        <div key={subcategory.id}>
                          <h4 className="font-medium mb-2">
                            {subcategory.subcategory_name}
                          </h4>
                          <div className="space-y-2">
                            {subcategory?.uploadedDocuments?.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                                  <span className="font-medium">
                                    {doc.document_rule_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    className="p-1 hover:bg-gray-200 rounded"
                                    onClick={() => handleView(doc.file_url)}
                                  >
                                    <Eye className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    className="p-1 hover:bg-gray-200 rounded"
                                    onClick={() =>
                                      handleDownload(
                                        doc.file_url,
                                        doc.document_rule_name
                                      )
                                    }
                                  >
                                    <Download className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                    Mark Verified
                                  </span>
                                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded">
                                    Invalid
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial & Banking Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Financial & Banking Details
                </h2>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Bank Details Confirmed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">
                    Account Holder Name
                  </p>
                  <p className="font-medium">
                    {vendor.bank_details.account_holder_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">
                    Bank Name & Branch
                  </p>
                  <p className="font-medium">
                    {vendor.bank_details.bank_name},{' '}
                    {vendor.bank_details.branch_name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Account Number</p>
                  <p className="font-mono">
                    **** **** ****{' '}
                    {vendor.bank_details.account_number.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">IFSC Code</p>
                  <p className="font-mono font-medium">
                    {vendor.bank_details.ifsc_code}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-2">Bank Account Proof</p>
                <div className="space-y-3">
                  {vendor?.bank_details?.documents?.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-green-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium">{doc.filename}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 hover:bg-green-100 rounded"
                          onClick={() => handleView(doc.url)}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          className="p-1 hover:bg-green-100 rounded"
                          onClick={() => handleDownload(doc.url, doc.filename)}
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-3 py-1 bg-green-600 text-white text-xs rounded">
                          Verified
                        </span>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded">
                          Invalid
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Verification Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="font-bold mb-4">Verification Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identity Verification</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      vendor.user.is_verified ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Legal Documentation</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      vendor.documents?.length > 0
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Financial Verification</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      vendor.bank_details ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Digital Signature</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      vendor.digital_signature_url
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Document Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Documents</span>
                  <span className="font-semibold">
                    {vendor?.documents?.length +
                      vendor?.bank_details?.documents?.length +
                      vendor?.categories?.reduce(
                        (total, category) =>
                          total +
                          category.subcategories.reduce(
                            (subTotal, subcategory) =>
                              subTotal + subcategory?.uploadedDocuments?.length,
                            0
                          ),
                        0
                      )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Verified</span>
                  <span className="font-semibold text-green-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    {vendor?.documents?.length +
                      vendor?.bank_details.documents?.length +
                      vendor?.categories.reduce(
                        (total, category) =>
                          total +
                          category.subcategories.reduce(
                            (subTotal, subcategory) =>
                              subTotal + subcategory?.uploadedDocuments?.length,
                            0
                          ),
                        0
                      )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Rejected</span>
                  <span className="font-semibold text-red-600">0</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Signature & Legal Acceptance</h3>
              <p className="text-sm text-gray-600 mb-4">Digital Signature</p>
              {vendor.digital_signature_url ? (
                <>
                  <div className="bg-gray-100 rounded-lg p-8 mb-3 flex items-center justify-center">
                    <img
                      src={vendor.digital_signature_url}
                      alt="Digital Signature"
                      className="max-w-full max-h-20 object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Signature captured on{' '}
                    {new Date(vendor.updated_at).toLocaleString()}
                  </p>
                </>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 mb-3 flex items-center justify-center">
                  <span className="text-gray-400 italic">
                    No Signature Available
                  </span>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs">Terms & Conditions Accepted</span>
                  <button className="ml-auto p-1">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">Internal Review Notes</h3>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                rows={4}
                placeholder="Add internal notes or comments. These are not visible to the vendor."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              ></textarea>
              <button
                className="w-full mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary"
                onClick={handleSaveNotes}
              >
                Save Note
              </button>
            </div>

            {/* History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold mb-4">History</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </p>
                  <p>Profile submitted by vendor</p>
                </div>
                <div>
                  <p className="text-gray-500">
                    {new Date(vendor.updated_at).toLocaleDateString()}
                  </p>
                  <p>Last updated</p>
                </div>
                {vendor.user.last_login && (
                  <div>
                    <p className="text-gray-500">
                      {new Date(vendor.user.last_login).toLocaleDateString()}
                    </p>
                    <p>Last login by vendor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
