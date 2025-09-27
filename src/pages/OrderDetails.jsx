import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { 
  fetchOrderByIdAPI, 
  updateOrderStatusAPI 
} from '../services/ordersService';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [statusError, setStatusError] = useState('');
  const [expectedDeliveryInput, setExpectedDeliveryInput] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundScreenshot, setRefundScreenshot] = useState(null);
  const [refundTransactionId, setRefundTransactionId] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const found = await fetchOrderByIdAPI(id);
        setOrder(found);
        setStatus('');
      } catch (err) {
        setError('Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (order && !status) {
      setStatus('');
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order || updating) return; 
    
    if (!status || status === order.orderStatus) {
      setStatusError('Please select a different status to update.');
      return;
    }
    
    if (status === 'CANCELLED' && order?.paymentStatus === 1) {
      setShowRefundModal(true);
      return;
    }
    
    if (status === 'REFUND_COMPLETED' && !order.refund) {
      setShowRefundModal(true);
      return;
    }
    
    setUpdating(true);
    setStatusError('');
    try {
      let additionalData = {};
      
      if (status === 'ORDER_CONFIRMED') {
        if (expectedDeliveryInput) {
          additionalData.expectedDelivery = new Date(expectedDeliveryInput).getTime();
        } else {
          additionalData.expectedDelivery = Date.now() + 4 * 24 * 60 * 60 * 1000;
        }
      }
      
      // Use the combined service function for both Firestore and Realtime DB updates
      const result = await updateOrderStatusAPI(
        order.id, 
        status,
        order.number,
        additionalData
      );
      
      // Update local state with the new data
      setOrder({ ...order, ...result.data });
      setStatus(''); // Reset status dropdown
      setExpectedDeliveryInput(''); // Reset date picker
      
    } catch (e) {
      console.error('Failed to update status:', e);
      setStatusError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefundSubmit = async () => {
    if (!refundScreenshot || !refundTransactionId.trim()) {
      setStatusError('Please provide both refund screenshot and transaction ID.');
      return;
    }

    setRefundSubmitting(true);
    setStatusError('');
    
    try {
      // Upload refund screenshot to Firebase Storage
      const storage = (await import('../lib/firebase')).storage;
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      
      const refundImageRef = ref(storage, `refund-screenshots/${order.id}-${Date.now()}`);
      const snapshot = await uploadBytes(refundImageRef, refundScreenshot);
      const refundScreenshotUrl = await getDownloadURL(snapshot.ref);
      
      // Prepare refund data
      const refundData = {
        refund: {
          transactionId: refundTransactionId,
          screenshot: refundScreenshotUrl,
          refundedAt: Date.now(),
          refundedBy: 'admin' // You can get this from auth context
        }
      };
      
      let targetStatus = status;
      if (status === 'CANCELLED') {
        targetStatus = 'CANCELLED';
      } else if (status === 'REFUND_COMPLETED') {
        targetStatus = 'REFUND_COMPLETED';
      }
      
      // Update order status with refund data
      const result = await updateOrderStatusAPI(
        order.id, 
        targetStatus,
        order.number,
        refundData
      );
      
      // Update local state
      setOrder({ ...order, ...result.data });
      setStatus('');
      setShowRefundModal(false);
      setRefundScreenshot(null);
      setRefundTransactionId('');
      
    } catch (e) {
      console.error('Failed to process refund:', e);
      setStatusError('Failed to process refund. Please try again.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleRefundModalClose = () => {
    setShowRefundModal(false);
    setRefundScreenshot(null);
    setRefundTransactionId('');
    setStatus(''); // Reset status selection
    setStatusError('');
  };

  const isPrepaidOrder = () => {
    return order?.paymentMethod === 1;
  };

  // Helper function to format timestamps properly
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    
    let date;
    
    // Handle Firestore Timestamp objects
    if (typeof timestamp === 'object' && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    }
    // Handle numeric timestamps
    else if (!isNaN(timestamp) && Number(timestamp) > 0) {
      date = new Date(Number(timestamp));
    }
    // Invalid or missing timestamp
    else {
      return '-';
    }
    
    // Check if date is valid and not the Unix epoch start
    if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
      return '-';
    }
    
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true
    });
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.orderStatus?.toLowerCase() === 'placed' ? 'bg-blue-100 text-blue-800' :
                    order.orderStatus?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
                    order.orderStatus?.toLowerCase() === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-800' :
                    order.orderStatus?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.orderStatus?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.orderStatus?.toLowerCase() === 'return_requested' ? 'bg-orange-100 text-orange-800' :
                    order.orderStatus?.toLowerCase() === 'return_initiated' ? 'bg-orange-100 text-orange-800' :
                    order.orderStatus?.toLowerCase() === 'return_rejected' ? 'bg-red-100 text-red-800' :
                    order.orderStatus?.toLowerCase() === 'refund_completed' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.orderStatus || 'Pending'}
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
                value={status || ''}
                onChange={e => setStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                disabled={updating}
              >
                <option value="" disabled>
                  {order.orderStatus ? `Current: ${order.orderStatus}` : 'Select Action'}
                </option>
                
                {order.orderStatus?.toLowerCase() === 'placed' && (
                  <>
                    <option value="CONFIRMED">Confirm Order</option>
                    <option value="CANCELLED">Cancel Order</option>
                  </>
                )}
                
                {order.orderStatus?.toLowerCase() === 'confirmed' && (
                  <>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="CANCELLED">Cancel Order</option>
                  </>
                )}
                
                {order.orderStatus?.toLowerCase() === 'out_for_delivery' && (
                  <option value="DELIVERED">Mark as Delivered</option>
                )}
                
                {/* RETURN_REQUESTED is set by client app when customer requests return */}
                {order.orderStatus?.toLowerCase() === 'return_requested' && (
                  <>
                    <option value="RETURN_INITIATED">Approve Return Request</option>
                    <option value="RETURN_REJECTED">Reject Return Request</option>
                  </>
                )}
                
                {order.orderStatus?.toLowerCase() === 'return_initiated' && (
                  <option value="OUT_FOR_PICKUP">Out for Pickup</option>
                )}
                
                {order.orderStatus?.toLowerCase() === 'out_for_pickup' && (
                  <option value="REFUND_INITIATED">Initiate Refund</option>
                )}
                
                {order.orderStatus?.toLowerCase() === 'refund_initiated' && (
                  <option value="REFUND_COMPLETED">Complete Refund</option>
                )}
                
              </select>
              {/* Date Picker for Expected Delivery - Only show when confirming order */}
              {status === 'CONFIRMED' && (
                <input
                  type="date"
                  value={expectedDeliveryInput}
                  onChange={e => setExpectedDeliveryInput(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  disabled={updating}
                  placeholder="Expected Delivery Date"
                  style={{ minWidth: '140px' }}
                />
              )}
              {/* <button className="bg-gray-100 p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button> */}
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !status || status === order.orderStatus}
                className="bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            {/* <button
              className="w-full mt-4 bg-green-700 text-white py-2 rounded text-sm"
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              View profile
            </button> */}
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
              <div><span className="font-medium">Payment Type:</span> 
                <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                  !isPrepaidOrder() 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {!isPrepaidOrder() ? 'Cash on Delivery' : 'Prepaid'}
                </span>
              </div>
              {isPrepaidOrder() && (
                <div><span className="font-medium">Transaction ID:</span> {order.razorpayPaymentId || order.paymentId || order.transactionId || '-'}</div>
              )}
              <div><span className="font-medium">Status:</span> {status || order.orderStatus || '-'}</div>
            </div>
            {/* <button className="w-full mt-4 bg-green-700 text-white py-2 rounded text-sm"
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Download Info
            </button> */}
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
            {/* <button className="w-full mt-4 bg-green-700 text-white py-2 rounded text-sm"
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              View profile
            </button> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
            {/* Refund Information - Show when order is cancelled with refund data */}
            {(order.orderStatus?.toLowerCase() === 'cancelled' || order.orderStatus?.toLowerCase() === 'refund_completed') && order.refund && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-semibold text-red-800 mb-2">Refund Information</h4>
                <div className="space-y-2 text-sm text-red-700">
                  <div>
                    <span className="font-medium">Transaction ID:</span> {order.refund.transactionId}
                  </div>
                  <div>
                    <span className="font-medium">Refunded On:</span>{' '}
                    {formatTimestamp(order.refund.refundedAt)}
                  </div>
                  {order.refund.screenshot && (
                    <div>
                      <span className="font-medium">Screenshot:</span>
                      <button
                        onClick={() => window.open(order.refund.screenshot, '_blank')}
                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        View Screenshot
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Order Progress - Right Side */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Order Progress</h3>
            </div>
            
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
              
              <div className={`absolute top-4 left-0 h-0.5 z-5 ${
                ['confirmed', 'out_for_delivery', 'delivered'].includes(order.orderStatus?.toLowerCase())
                  ? 'bg-green-500' 
                  : ['placed'].includes(order.orderStatus?.toLowerCase())
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`} style={{
                width: order.orderStatus?.toLowerCase() === 'delivered' ? '100%' :
                       order.orderStatus?.toLowerCase() === 'out_for_delivery' ? '66.66%' :
                       order.orderStatus?.toLowerCase() === 'confirmed' ? '33.33%' :
                       order.orderStatus?.toLowerCase() === 'placed' ? '0%' : '0%'
              }}></div>
              
              <div className="flex items-center justify-between mb-8 relative">
                {/* Order Placed */}
                <div className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-20 bg-white border-2 ${
                    ['placed', 'confirmed', 'out_for_delivery', 'delivered'].includes(order.orderStatus?.toLowerCase()) 
                      ? 'border-green-500' : 'border-gray-300'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      ['placed', 'confirmed', 'out_for_delivery', 'delivered'].includes(order.orderStatus?.toLowerCase())
                        ? 'text-green-500' : 'text-gray-500'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6a2 2 0 114 0v1H8V6zm0 3a1 1 0 012 0v3a1 1 0 11-2 0V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium">Order Placed</div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(order.orderPlacedAt || order.orderDate)}
                    </div>
                  </div>
                </div>

                  {/* Order Confirmed */}
                  <div className="flex flex-col items-center relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-20 bg-white border-2 ${
                      ['confirmed', 'out_for_delivery', 'delivered'].includes(order.orderStatus?.toLowerCase())
                        ? 'border-green-500' : 'border-gray-300'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        ['confirmed', 'out_for_delivery', 'delivered'].includes(order.orderStatus?.toLowerCase())
                          ? 'text-green-500' : 'text-gray-500'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>

                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium">Order Confirmed</div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(order.orderConfirmedAt)}
                    </div>
                  </div>
                </div>

                {/* Out for Delivery */}
                <div className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-20 bg-white border-2 ${
                    ['out_for_delivery', 'delivered'].includes(order.orderStatus?.toLowerCase())
                      ? 'border-green-500' : 'border-gray-300'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      ['out_for_delivery', 'delivered'].includes(order.orderStatus?.toLowerCase())
                        ? 'text-green-500' : 'text-gray-500'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
                    </svg>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium">Out for Delivery</div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(order.outForDeliveryAt)}
                    </div>
                  </div>
                </div>

                  {/* Order Delivered */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-20 bg-white border-2 ${
                      order.orderStatus?.toLowerCase() === 'delivered' ? 'border-green-500' : 'border-gray-300'
                    }`}>
                    <svg className={`w-4 h-4 ${
                      order.orderStatus?.toLowerCase() === 'delivered' ? 'text-green-500' : 'text-gray-500'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium">Order Delivered</div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(order.orderDeliveredAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Return/Refund Flow - Show only if applicable */}
              {['return_requested', 'return_initiated', 'return_rejected', 'out_for_pickup', 'refund_initiated', 'refund_completed'].includes(order.orderStatus?.toLowerCase()) && (
                <div className="border-t pt-6 mt-4">
                  <div className="text-sm font-medium text-orange-600 mb-4">Return/Refund Process</div>
                  
                  <div className="relative">
                    {/* Background connecting line for return/refund */}
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200"></div>
                    
                    {/* Progress overlay line for return/refund */}
                    <div className={`absolute top-3 left-0 h-0.5 z-5 ${
                      ['refund_completed'].includes(order.orderStatus?.toLowerCase())
                        ? 'bg-orange-500' 
                        : ['refund_initiated'].includes(order.orderStatus?.toLowerCase())
                        ? 'bg-orange-500'
                        : ['return_initiated', 'out_for_pickup'].includes(order.orderStatus?.toLowerCase())
                        ? 'bg-orange-500'
                        : ['return_requested'].includes(order.orderStatus?.toLowerCase())
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`} style={{
                      width: order.orderStatus?.toLowerCase() === 'refund_completed' ? '100%' :
                             order.orderStatus?.toLowerCase() === 'refund_initiated' ? '66.66%' :
                             order.orderStatus?.toLowerCase() === 'out_for_pickup' ? '33.33%' :
                             order.orderStatus?.toLowerCase() === 'return_initiated' ? '33.33%' :
                             order.orderStatus?.toLowerCase() === 'return_requested' ? '0%' : '0%'
                    }}></div>
                    
                    <div className="flex items-center justify-between relative">
                      {/* Return Requested */}
                      <div className="flex flex-col items-center relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-20 bg-white border-2 ${
                          ['return_requested', 'return_initiated', 'out_for_pickup', 'refund_initiated', 'refund_completed'].includes(order.orderStatus?.toLowerCase())
                            ? 'border-orange-500' : 'border-gray-300'
                        }`}>
                          <svg className={`w-3 h-3 ${
                            ['return_requested', 'return_initiated', 'out_for_pickup', 'refund_initiated', 'refund_completed'].includes(order.orderStatus?.toLowerCase())
                              ? 'text-orange-500' : 'text-gray-500'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium">Return Requested</div>
                          <div className="text-xs text-gray-500">
                            {formatTimestamp(order.returnRequestedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Return Approved / Out for Pickup */}
                      <div className="flex flex-col items-center relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-20 bg-white border-2 ${
                          ['return_initiated', 'out_for_pickup', 'refund_initiated', 'refund_completed'].includes(order.orderStatus?.toLowerCase())
                            ? 'border-orange-500' : 'border-gray-300'
                        }`}>
                          <svg className={`w-3 h-3 ${
                            ['return_initiated', 'out_for_pickup', 'refund_initiated', 'refund_completed'].includes(order.orderStatus?.toLowerCase())
                              ? 'text-orange-500' : 'text-gray-500'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium">
                            {order.orderStatus?.toLowerCase() === 'out_for_pickup' ? 'Out for Pickup' : 'Return Approved'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimestamp(order.returnInitiatedAt || order.outForPickupAt)}
                          </div>
                        </div>
                      </div>

                      {/* Refund Initiated */}
                      <div className="flex flex-col items-center relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-20 bg-white border-2 ${
                          ['refund_initiated', 'refund_completed'].includes(order.orderStatus?.toLowerCase())
                            ? 'border-orange-500' : 'border-gray-300'
                        }`}>
                          <svg className={`w-3 h-3 ${
                            ['refund_initiated', 'refund_completed'].includes(order.orderStatus?.toLowerCase())
                              ? 'text-orange-500' : 'text-gray-500'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v4H4v-4z" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium">Refund Initiated</div>
                          <div className="text-xs text-gray-500">
                            {formatTimestamp(order.refundInitiatedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Refund Completed */}
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-20 bg-white border-2 ${
                          order.orderStatus?.toLowerCase() === 'refund_completed' 
                            ? 'border-teal-500' : 'border-gray-300'
                        }`}>
                          <svg className={`w-3 h-3 ${
                            order.orderStatus?.toLowerCase() === 'refund_completed' ? 'text-teal-500' : 'text-gray-500'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1.001-.612 1.5C6.279 7.784 6 8.202 6 9s.279 1.216.409 1.55c.105.499.327 1.025.612 1.5C7.721 13.216 8.768 14 10 14s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C11.792 11.807 11.304 12 11 12c-.304 0-.792-.193-1.264-.979C9.208 10.193 9 9.598 9 9s.208-1.193.736-2.021z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium">Refund Completed</div>
                          <div className="text-xs text-gray-500">
                            {formatTimestamp(order.refundCompletedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                      <span>GST</span>
                      <span>₹{order.gst ?? '0.00'}</span>
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
                      <span>₹{order.finalPrice ?? '-'}</span>
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

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Process Refund</h3>
                <button
                  onClick={handleRefundModalClose}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={refundSubmitting}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {status === 'CANCELLED' 
                    ? 'This is a prepaid order. Please upload the refund screenshot and provide transaction ID before cancelling.'
                    : 'Please upload the refund screenshot and provide transaction ID to complete the refund process.'
                  }
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Transaction ID Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={refundTransactionId}
                    onChange={(e) => setRefundTransactionId(e.target.value)}
                    placeholder="Enter refund transaction ID"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    disabled={refundSubmitting}
                  />
                </div>
                
                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Screenshot <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {refundScreenshot ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(refundScreenshot)}
                          alt="Refund screenshot"
                          className="max-h-32 mx-auto rounded"
                        />
                        <p className="text-sm text-gray-600">{refundScreenshot.name}</p>
                        <button
                          onClick={() => setRefundScreenshot(null)}
                          className="text-red-600 text-sm hover:text-red-700"
                          disabled={refundSubmitting}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setRefundScreenshot(e.target.files[0])}
                          className="hidden"
                          id="refund-screenshot"
                          disabled={refundSubmitting}
                        />
                        <label
                          htmlFor="refund-screenshot"
                          className="cursor-pointer inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Click to upload refund screenshot
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRefundModalClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={refundSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefundSubmit}
                  disabled={refundSubmitting || !refundScreenshot || !refundTransactionId.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {refundSubmitting 
                    ? 'Processing...' 
                    : status === 'CANCELLED' 
                      ? 'Process Refund & Cancel'
                      : 'Complete Refund Process'
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
