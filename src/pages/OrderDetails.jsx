import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchOrderByIdAPI, updateOrderAPI } from '../services/ordersService';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const found = await fetchOrderByIdAPI(id);
        setOrder(found);
        setStatus(found?.orderStatus || '');
      } catch (err) {
        setError('Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderAPI(order.id, { orderStatus: status });
      setOrder({ ...order, orderStatus: status });
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="pt-6 pb-2">
          <h1 className="text-2xl font-bold text-green-700">Order Details</h1>
          <div className="text-gray-500 text-sm">Order ID: <span className="font-mono">{order.id}</span></div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <div className="text-lg font-semibold mb-2">Order Status</div>
              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                  disabled={updating}
                >
                  <option value="">Select status</option>
                  <option value="Placed">Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  className="ml-2 px-3 py-1 bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 text-sm"
                  onClick={handleStatusUpdate}
                  disabled={updating || status === order.orderStatus}
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold mb-2">Order Date</div>
              <div className="text-gray-700">
                {order.orderDate
                  ? (typeof order.orderDate === 'object' && order.orderDate.seconds
                      ? new Date(order.orderDate.seconds * 1000).toLocaleDateString()
                      : !isNaN(order.orderDate)
                        ? new Date(Number(order.orderDate)).toLocaleDateString()
                        : order.orderDate)
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold mb-2">Total Price</div>
              <div className="text-gray-700">{order.totalSubPrice ?? '-'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-lg font-semibold mb-3 text-green-700">Product Details</div>
              <div className="flex gap-4 items-center mb-2">
                {order.product?.image ? (
                  <img src={order.product.image} alt="Product" className="w-24 h-24 object-cover border rounded-lg" />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 border rounded-lg flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div>
                  <div className="font-semibold">{order.product?.name ?? '-'}</div>
                  <div className="text-sm text-gray-500">{order.product?.category ?? '-'}</div>
                  <div className="text-xs text-gray-400">Brand: {order.product?.brand ?? '-'}</div>
                  <div className="text-xs text-gray-400">Animal: {order.product?.animal ?? '-'}</div>
                  <div className="text-xs text-gray-400">SKU: {order.product?.sku ?? '-'}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex"><b className="w-28 inline-block text-left">Description</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.product?.description ?? '-'}</span></div>
                <div className="flex"><b className="w-28 inline-block text-left">Quantity</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.product?.cartQuantity ?? '-'}</span></div>
                <div className="flex"><b className="w-28 inline-block text-left">Regular Price</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.product?.regularPrice ?? '-'}</span></div>
                <div className="flex"><b className="w-28 inline-block text-left">Sale Price</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.product?.salePrice ?? '-'}</span></div>
                {/* <div className="flex"><b className="w-28 inline-block text-left">Stock Quantity</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.product?.stockQuantity ?? '-'}</span></div> */}
                <div className="flex"><b className="w-28 inline-block text-left">Status</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.product?.status ?? '-'}</span></div>
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold mb-3 text-green-700">Customer & Address</div>
              <div className="space-y-1">
                <div className="flex"><b className="w-24 inline-block text-left">Name</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.address ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() : '-'}</span></div>
                <div className="flex"><b className="w-24 inline-block text-left">Phone</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.address?.phoneNumber ?? order.address?.phone ?? '-'}</span></div>
                <div className="flex"><b className="w-24 inline-block text-left">Nearby</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.address?.nearBy && order.address.nearBy !== '' ? order.address.nearBy : '-'}</span></div>
                <div className="flex"><b className="w-24 inline-block text-left">House</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.address?.house ?? '-'}</span></div>
                <div className="flex"><b className="w-24 inline-block text-left">Road</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.address?.road ?? '-'}</span></div>
                <div className="flex"><b className="w-24 inline-block text-left">City</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.address?.city ?? '-'}</span></div>
                <div className="flex"><b className="w-24 inline-block text-left">Pincode</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.address?.pinCode && order.address.pinCode !== '' ? order.address.pinCode : '-'}</span></div>
                <div className="flex"><b className="w-24 inline-block text-left">State</b><span className="inline-block w-1 text-right pr-2">:</span><span className="text-gray-700 flex-1">{order.address?.state ?? '-'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
