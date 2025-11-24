import React, { useState, useEffect } from 'react';
import { Input, Button, message, Spin, Switch, Modal, Tag, Card } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { FaDollarSign, FaImages, FaTag, FaStore } from 'react-icons/fa';
import { BsInfoCircleFill } from 'react-icons/bs';
import { TbLayersDifference } from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import privateApi from '@/lib/http';

const { TextArea } = Input;
const { confirm } = Modal;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);
  const [productStatus, setProductStatus] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const { data } = await privateApi.get(`/admin/products/${id}`);

        setProductData(data);
        setProductStatus(data.status === 'approved');
        setRejectionFeedback(data.rejection_reasons || '');
      } catch (err) {
        console.error('Error fetching product data:', err);
        message.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id, refresh]);

  const showApproveConfirm = () => {
    confirm({
      title: 'Are you sure you want to approve this product?',
      icon: <ExclamationCircleOutlined />,
      content: 'This product will be published and visible to customers.',
      okText: 'Yes, Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk() {
        handleApprove();
      },
    });
  };

  const showRejectConfirm = () => {
    confirm({
      title: 'Are you sure you want to reject this product?',
      icon: <ExclamationCircleOutlined />,
      content: 'This product will be rejected and the seller will be notified.',
      okText: 'Yes, Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        handleReject();
      },
    });
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await privateApi.patch(`/admin/products/${id}/approve`);
      message.success('Product approved successfully');
      setProductStatus(true);
      setRefresh(!refresh);
    } catch (e: any) {
      if (e) {
        if (e.response) {
          message.error(e.response.data.error);
        }
      } else {
        message.error('Failed to approve product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionFeedback.trim()) {
      message.warning('Please provide rejection feedback');
      return;
    }

    try {
      setLoading(true);
      await privateApi.patch(`/admin/products/${id}/reject`, {
        rejection_reason: rejectionFeedback,
      });
      message.success('Product rejected successfully');
      setProductStatus(false);
      setRefresh(!refresh);
    } catch {
      message.error('Failed to reject product');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) =>
    `₹${(cents / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'draft':
        return 'orange';
      default:
        return 'blue';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* LEFT SIDE */}
        <div className="w-2/3 space-y-6">
          {/* Product Identity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaTag className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Product Identity</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input value={productData.product_name} readOnly />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <Input value={productData.brand} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <Input value={productData.sku} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <BsInfoCircleFill className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Core Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                <TextArea value={productData.description} readOnly rows={4} />
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={productData.category?.category_name || '-'}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sub Category</label>
                  <Input
                    value={productData.subcategory?.subcategory_name || '-'}
                    readOnly
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="text-sm font-medium">Weight (grams)</label>
                <Input value={`${productData.weight} g`} readOnly />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaImages className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Product Images</h2>
            </div>
            <div className="flex gap-4 flex-wrap">
              {productData.images && productData.images.length > 0 ? (
                productData.images.map((image: any) => (
                  <img
                    key={image.id}
                    src={image.image_url}
                    alt="Product"
                    className="w-32 h-32 rounded-lg object-cover shadow-md border border-gray-200 hover:scale-105 transition-transform duration-300"
                  />
                ))
              ) : (
                <div className="text-gray-500 text-center w-full py-4">
                  No images available
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <TbLayersDifference className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Product Variants</h2>
            </div>

            {productData.variants && productData.variants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productData.variants.map((variant: any) => {
                  const hasImages =
                    variant.variant_images && variant.variant_images.length > 0;

                  return (
                    <Card
                      key={variant.id}
                      className="border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                      bodyStyle={{ padding: '16px' }}
                    >
                      {/* Variant Images Carousel */}
                      <div className="flex justify-center mb-3">
                        {hasImages ? (
                          <div className="relative">
                            <img
                              src={variant.variant_images[0].image_url}
                              alt={`${variant.option_name} - ${variant.option_value}`}
                              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                            />
                            {/* Image counter badge */}
                            {variant.variant_images.length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {variant.variant_images.length}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs text-center">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Variant Details */}
                      <div className="space-y-2">
                        <div className="text-center">
                          <h3 className="font-medium text-gray-800 capitalize">
                            {variant.option_name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {variant.option_value}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-left">
                            <span className="text-gray-500">Price:</span>
                          </div>
                          <div className="text-right font-semibold">
                            {formatPrice(variant.price_cents)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-left">
                            <span className="text-gray-500">Stock:</span>
                          </div>
                          <div className="text-right">
                            <Tag
                              color={variant.available > 0 ? 'green' : 'red'}
                              className="m-0"
                            >
                              {variant.available > 0
                                ? `${variant.available} available`
                                : 'Out of stock'}
                            </Tag>
                          </div>
                        </div>

                        {variant.sku && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-left">
                              <span className="text-gray-500">SKU:</span>
                            </div>
                            <div className="text-right font-mono text-xs">
                              {variant.sku}
                            </div>
                          </div>
                        )}

                        {/* Image count info */}
                        {hasImages && (
                          <div className="text-center pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                              {variant.variant_images.length} image
                              {variant.variant_images.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No variants available
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/3 space-y-6">
          {/* Status & Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Product Status</h2>
              <Tag
                color={getStatusColor(productData.status)}
                className="capitalize"
              >
                {productData.status}
              </Tag>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Rejection Reasons</label>
                <TextArea
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  rows={3}
                  placeholder="Add rejection feedback if any..."
                  className="mt-1"
                />
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={showApproveConfirm}
                  disabled={productData.status === 'approved'}
                >
                  {productData.status === 'approved'
                    ? 'Already Approved'
                    : 'Approve Product'}
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={showRejectConfirm}
                  disabled={productData.status === 'rejected'}
                >
                  {productData.status === 'rejected'
                    ? 'Already Rejected'
                    : 'Reject Product'}
                </Button>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaDollarSign className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Price</label>
                <Input
                  prefix="₹"
                  value={formatPrice(productData.price_cents)}
                  readOnly
                  className="font-semibold"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Compare At Price</label>
                <Input
                  prefix="₹"
                  value={
                    productData.compare_at_price_cents
                      ? formatPrice(productData.compare_at_price_cents)
                      : 'Not set'
                  }
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Total Stock Quantity
                </label>
                <Input value={productData.stock_quantity} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <Input value={productData.currency} readOnly />
              </div>
            </div>
          </div>

          {/* SEO Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">SEO Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Meta Title</label>
                <Input
                  value={productData.meta_title || 'Not set'}
                  readOnly
                  placeholder="No meta title provided"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Meta Description</label>
                <TextArea
                  value={productData.meta_description || 'Not set'}
                  rows={3}
                  readOnly
                  placeholder="No meta description provided"
                />
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaStore className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Vendor Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input value={productData.vendor?.company_name} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Business Type</label>
                <Input value={productData.vendor?.business_type} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">GST Number</label>
                <Input value={productData.vendor?.gst_number} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Verification Status
                </label>
                <Input
                  value={productData.vendor?.verification_status}
                  readOnly
                  className="capitalize"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input value={productData.vendor?.city} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input value={productData.vendor?.state} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created At:</span>
                <span className="text-sm text-gray-600">
                  {new Date(productData.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Updated:</span>
                <span className="text-sm text-gray-600">
                  {new Date(productData.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
