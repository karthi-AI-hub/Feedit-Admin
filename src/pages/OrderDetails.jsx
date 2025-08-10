import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchOrderByIdAPI, updateOrderAPI } from '../services/ordersService';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [statusError, setStatusError] = useState('');

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
    if (!order || updating) return; // Prevent duplicate submissions
    
    setUpdating(true);
    setStatusError('');
    try {
      await updateOrderAPI(order.id, { orderStatus: status });
      setOrder({ ...order, orderStatus: status });
    } catch (e) {
      console.error('Failed to update status:', e);
      setStatusError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-10">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading Order Details...</p>
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
  if (!order) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-10">
          <p className="text-gray-500">Order not found.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-green-700">Order Details</h1>
          </div>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-bold text-gray-900">Orders ID: #{order.id.slice(-6)}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {status || order.orderStatus || 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 11v-6m0 0L8 9m4 3l4-3M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {order.orderDate
                    ? (typeof order.orderDate === 'object' && order.orderDate.seconds
                        ? new Date(order.orderDate.seconds * 1000).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          }) + ' - ' + new Date(order.orderDate.seconds * 1000 + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })
                        : !isNaN(order.orderDate)
                          ? new Date(Number(order.orderDate)).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) + ' - ' + new Date(Number(order.orderDate) + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : order.orderDate)
                    : '-'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                disabled={updating}
              >
                <option value="">Change Status</option>
                <option value="Placed">Placed</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button className="bg-gray-100 p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || status === order.orderStatus}
                className="bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Top Row - Customer, Order Info, Deliver To (Horizontal Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Customer */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Customer</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Full Name:</span> {order.address ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() : '-'}</div>
              <div><span className="font-medium">Email:</span> {order.address?.email ?? '-'}</div>
              <div><span className="font-medium">Phone:</span> {order.address?.phoneNumber ?? order.address?.phone ?? '-'}</div>
            </div>
            <button className="w-full mt-4 bg-green-700 text-white py-2 rounded text-sm">
              View profile
            </button>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 11.5V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Order Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Shipping:</span> {order.shippingMethod ?? 'Standard Delivery'}</div>
              <div><span className="font-medium">Payment Method:</span> {order.paymentMethod ?? 'Cash on Delivery'}</div>
              <div><span className="font-medium">Status:</span> {status || order.orderStatus}</div>
            </div>
            <button className="w-full mt-4 bg-green-700 text-white py-2 rounded text-sm">
              Download Info
            </button>
          </div>

          {/* Deliver to */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Deliver to</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Address:</span> {
                [
                  order.address?.house,
                  order.address?.road, 
                  order.address?.city,
                  order.address?.state,
                  order.address?.pinCode
                ].filter(Boolean).join(', ') || '-'
              }</div>
              <div><span className="font-medium">Nearby:</span> {order.address?.nearBy ?? '-'}</div>
            </div>
            <button className="w-full mt-4 bg-green-700 text-white py-2 rounded text-sm">
              View profile
            </button>
          </div>
        </div>

        {/* Main Content - Payment Info and Progress Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Info - Left Side */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Info</h3>
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-red-500 rounded-sm flex items-center justify-center">
                  <div className="w-4 h-3 bg-yellow-400 rounded-sm"></div>
                </div>
                <span className="text-sm font-medium">{order.paymentMethod ?? 'Cash on Delivery'}</span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Business name: {order.address ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() : '-'}</div>
              <div>Phone: {order.address?.phoneNumber ?? order.address?.phone ?? '-'}</div>
            </div>
          </div>

          {/* Order Progress - Right Side */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Bought - Awaiting Delivery</h3>
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </button>
            </div>
            
            {/* Progress Timeline */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {/* Order Created */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-center">Order Created</div>
                  <div className="text-xs text-gray-500 text-center">
                    {order.orderDate
                      ? (typeof order.orderDate === 'object' && order.orderDate.seconds
                          ? new Date(order.orderDate.seconds * 1000).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) + ', ' + new Date(order.orderDate.seconds * 1000).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          : !isNaN(order.orderDate)
                            ? new Date(Number(order.orderDate)).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              }) + ', ' + new Date(Number(order.orderDate)).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })
                            : order.orderDate)
                      : '-'}
                  </div>
                </div>

                {/* Progress Line */}
                <div className={`flex-1 h-0.5 mx-4 ${
                  order.orderStatus === 'Processing' || order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}></div>

                {/* Order Processing/Shipped */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    order.orderStatus === 'Processing' || order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      order.orderStatus === 'Processing' || order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' 
                        ? 'text-white' 
                        : 'text-gray-500'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-center">Order Processing</div>
                  <div className="text-xs text-gray-500 text-center">
                    {order.processingDate
                      ? (typeof order.processingDate === 'object' && order.processingDate.seconds
                          ? new Date(order.processingDate.seconds * 1000).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) + ', ' + new Date(order.processingDate.seconds * 1000).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          : !isNaN(order.processingDate)
                            ? new Date(Number(order.processingDate)).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              }) + ', ' + new Date(Number(order.processingDate)).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })
                            : order.processingDate)
                      : '-'}
                  </div>
                </div>

                {/* Progress Line */}
                <div className={`flex-1 h-0.5 mx-4 ${
                  order.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>

                {/* Order Delivered */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    order.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      order.orderStatus === 'Delivered' ? 'text-white' : 'text-gray-500'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      {order.orderStatus === 'Delivered' ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <>
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-center">Order Delivered</div>
                  <div className="text-xs text-gray-500 text-center">
                    {order.deliveredDate
                      ? (typeof order.deliveredDate === 'object' && order.deliveredDate.seconds
                          ? new Date(order.deliveredDate.seconds * 1000).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) + ', ' + new Date(order.deliveredDate.seconds * 1000).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          : !isNaN(order.deliveredDate)
                            ? new Date(Number(order.deliveredDate)).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              }) + ', ' + new Date(Number(order.deliveredDate)).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })
                            : order.deliveredDate)
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-900">Products</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {order.product?.image ? (
                              <img className="h-10 w-10 rounded object-cover" src={order.product.image} alt="" />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{order.product?.name ?? '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.product?.cartQuantity ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.product?.salePrice ?? order.product?.regularPrice ?? '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Order Summary */}
              <div className="border-t p-6">
                <div className="max-w-sm ml-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{order.totalSubPrice ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{order.tax ?? '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>₹{order.discount ?? '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Rate</span>
                      <span>₹{order.shippingRate ?? '0'}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{order.totalSubPrice ?? '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Status Error Display */}
        {statusError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {statusError}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
