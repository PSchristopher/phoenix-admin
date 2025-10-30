import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Button,
  Upload,
  message,
  Spin,
  Switch,
  Modal,
} from 'antd';
import {
  UploadOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { FaDollarSign, FaEye, FaImages, FaTag } from 'react-icons/fa';
import { BsInfoCircleFill } from 'react-icons/bs';
import { TbLayersDifference } from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import privateApi from '@/lib/http';

const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);
  const [productStatus, setProductStatus] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const { data } = await privateApi.get(`/admin/products/${id}`);

        setProductData(data);
        setProductStatus(data.status === 'approved');
        setRejectionFeedback(data.rejection_reason || '');

        // if (data.images?.length > 0) {
        //   const formattedFileList = data.images.map((img: any, i: number) => ({
        //     uid: `-${i + 1}`,
        //     name: img.image_key,
        //     status: 'done',
        //     url: `https://your-blob-storage-url/${img.image_key}`, // Replace with your Azure Blob URL
        //   }));
        //   setFileList(formattedFileList);
        // }
      } catch (err) {
        console.error('Error fetching product data:', err);
        message.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id, refresh]);

  const uploadProps = {
    fileList,
    listType: 'picture-card' as const,
    onChange: ({ fileList: newList }: any) => setFileList(newList),
  };

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
      setLoading(false);
    } catch {
      setLoading(false);

      message.error('Failed to approve product');
    }
  };

  const handleReject = async () => {
    setLoading(true);

    if (!rejectionFeedback.trim()) {
      message.warning('Please provide rejection feedback');
      return;
    }

    try {
      await privateApi.patch(`/admin/products/${id}/reject`, {
        rejection_reason: rejectionFeedback,
      });
      message.success('Product rejected successfully');
      setProductStatus(false);
      setRefresh(!refresh);
      setLoading(false);
    } catch {
      setLoading(false);

      message.error('Failed to reject product');
    }
  };

  const formatPrice = (cents: number) =>
    ` ${(cents / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
    })}`;

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
                <Input value={productData.title} readOnly />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <Input value={productData.brand} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <Input value={productData.local_sku} readOnly />
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
              {/* cat and sub cat */}
              <div className="flex gap-10">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input value={productData.meta?.fit || '-'} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Sub Category</label>
                  <Input value={productData.meta?.fit || '-'} readOnly />
                </div>
              </div>
              {/* Tags */}
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {productData.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-gray-100 px-2 py-1 rounded text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Fit</label>
                  <Input value={productData.meta?.fit || '-'} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Wash</label>
                  <Input value={productData.meta?.wash || '-'} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Material</label>
                  <Input value={productData.meta?.material || '-'} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaImages className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Product Images</h2>
            </div>
            <div className="flex gap-4">
              {' '}
              {productData &&
              productData.images &&
              productData.images.length > 0 ? (
                productData.images.map((i, index) => {
                  const imageUrl = i.image_link
                    ? i.image_link
                    : 'https://via.placeholder.com/150?text=No+Image'; // fallback image

                  return (
                    <img
                      key={index}
                      src={imageUrl}
                      alt="Product"
                      className="w-28 h-28 rounded-lg object-cover shadow-md border border-gray-200 hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/150?text=Image+Not+Found';
                      }}
                    />
                  );
                })
              ) : (
                <img
                  src="https://via.placeholder.com/150?text=No+Image"
                  alt="No product image"
                  className="w-28 h-28 rounded-lg object-cover shadow-md border border-gray-200"
                />
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <TbLayersDifference className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Variants</h2>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Variant</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Inventory</th>
                </tr>
              </thead>
              <tbody>
                {productData.variants?.map((v: any) => (
                  <tr key={v.id} className="border-b last:border-none">
                    <td className="p-2">
                      {v.options.size} / {v.options.color}
                    </td>
                    <td className="p-2">{formatPrice(v.price_cents)}</td>
                    <td className="p-2">{v.inventory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Approve / Reject */}
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={showRejectConfirm}>Reject</Button>
            <Button type="primary" onClick={showApproveConfirm}>
              Approve
            </Button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/3 space-y-6">
          {/* Feedback */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Feedback & Actions</h2>
            <TextArea
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              rows={3}
              placeholder="Add rejection feedback if any..."
            />
            <div className="flex flex-col gap-2 mt-4">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={showApproveConfirm}
              >
                Approve Product
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={showRejectConfirm}
              >
                Reject Product
              </Button>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaDollarSign className="text-primary text-xl" />
              <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
            </div>
            <div className="space-y-3 flex flex-col gap-2">
              <label className="" htmlFor="">
                Price
              </label>
              <Input
                prefix="₹"
                value={formatPrice(productData.price_cents)}
                readOnly
              />
              <label className="" htmlFor="">
                Stock Quantity
              </label>

              <Input
                type="number"
                value={productData.variants?.[0]?.inventory || 0}
                readOnly
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium">Product Status</div>
                <div className="text-sm text-gray-500">
                  {productData.status || 'draft'}
                </div>
              </div>
              <Switch checked={productStatus} disabled />
            </div>

            <div>
              <label className="text-sm font-medium">Meta Title</label>
              <Input value={productData.title} readOnly />
            </div>

            <div className="mt-3">
              <label className="text-sm font-medium">Meta Description</label>
              <TextArea value={productData.description} rows={2} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
