import { db, database } from '../lib/firebase';
import { collection, getDoc, getDocs, doc, updateDoc, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { ref, set, get, push, remove } from 'firebase/database';

// ==================== FIRESTORE OPERATIONS ====================

// Fetch all orders
export const fetchOrdersAPI = async () => {
  const ordersCollection = collection(db, 'ORDERS');
  const ordersSnapshot = await getDocs(ordersCollection);
  return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch a single order by id
export const fetchOrderByIdAPI = async (id) => {
  const orderRef = doc(db, 'ORDERS', id);
  const orderSnap = await getDoc(orderRef);
  // Try to get the document directly
  try {
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() };
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
};

// Update an order (e.g., status)
export const updateOrderAPI = async (id, data) => {
  const orderRef = doc(db, 'ORDERS', id);
  await updateDoc(orderRef, data);
};

// Add a new order
export const addOrderAPI = async (order) => {
  const docRef = await addDoc(collection(db, 'ORDERS'), order);
  return { id: docRef.id, ...order };
};

// Delete an order
export const deleteOrderAPI = async (id) => {
  const orderRef = doc(db, 'ORDERS', id);
  await deleteDoc(orderRef);
};

// ==================== REALTIME DATABASE OPERATIONS ====================

// Add order status update to Realtime Database
export const addOrderStatusUpdateToRealtimeDB = async (orderId, finalStatus, number) => {
  try {
    const orderRef = ref(database, `orderStatus/${orderId}`);
    const currentTime = Date.now(); // Get current time as milliseconds since epoch
    
    await set(orderRef, {
      documentId: orderId,
      status: finalStatus,
      number: number,
      updatedAt: currentTime,
      // Payment statuses
      paymentPendingAt: finalStatus === 'PAYMENT_PENDING' ? currentTime : null,
      paymentSuccessAt: finalStatus === 'PAYMENT_SUCCESS' ? currentTime : null,
      paymentFailedAt: finalStatus === 'PAYMENT_FAILED' ? currentTime : null,
      // Order statuses
      orderPlacedAt: finalStatus === 'PLACED' ? currentTime : null,
      orderConfirmedAt: finalStatus === 'CONFIRMED' ? currentTime : null,
      outForDeliveryAt: finalStatus === 'OUT_FOR_DELIVERY' ? currentTime : null,
      orderDeliveredAt: finalStatus === 'DELIVERED' ? currentTime : null,
      orderCancelledAt: finalStatus === 'CANCELLED' ? currentTime : null,
      // Return/Refund statuses
      returnRequestedAt: finalStatus === 'RETURN_REQUESTED' ? currentTime : null,
      returnInitiatedAt: finalStatus === 'RETURN_INITIATED' ? currentTime : null,
      returnRejectedAt: finalStatus === 'RETURN_REJECTED' ? currentTime : null,
      outForPickupAt: finalStatus === 'OUT_FOR_PICKUP' ? currentTime : null,
      returnPickedAt: finalStatus === 'RETURN_PICKED' ? currentTime : null,
      refundInitiatedAt: finalStatus === 'REFUND_INITIATED' ? currentTime : null,
      refundCompletedAt: finalStatus === 'REFUND_COMPLETED' ? currentTime : null,
      // Additional statuses
      disputeRaisedAt: finalStatus === 'DISPUTE_RAISED' ? currentTime : null,
      disputeResolvedAt: finalStatus === 'DISPUTE_RESOLVED' ? currentTime : null
    });
    
    // console.log(`Order status update added to realtime database: ${finalStatus} for order ${orderId}`);
    return true;
  } catch (error) {
    console.error('Failed to add order status to realtime database:', error);
    // Don't throw error to prevent breaking the main flow
    return false;
  }
};

// Get order status from Realtime Database
export const getOrderStatusFromRealtimeDB = async (orderId) => {
  try {
    const orderRef = ref(database, `orderStatus/${orderId}`);
    const snapshot = await get(orderRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch order status from realtime database:', error);
    throw error;
  }
};

// Get all order status updates from Realtime Database
export const getAllOrderStatusFromRealtimeDB = async () => {
  try {
    const orderStatusRef = ref(database, 'orderStatus');
    const snapshot = await get(orderStatusRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {};
    }
  } catch (error) {
    console.error('Failed to fetch all order status from realtime database:', error);
    throw error;
  }
};

// Remove order status from Realtime Database
export const removeOrderStatusFromRealtimeDB = async (orderId) => {
  try {
    const orderRef = ref(database, `orderStatus/${orderId}`);
    await remove(orderRef);
    console.log('Order status removed from realtime database successfully');
    return true;
  } catch (error) {
    console.error('Failed to remove order status from realtime database:', error);
    throw error;
  }
};

// ==================== COMBINED OPERATIONS ====================

// Update order status in both Firestore and Realtime Database
export const updateOrderStatusAPI = async (orderId, newStatus, number, additionalData = {}) => {
  // Prepare Firestore updates
  let firestoreUpdates = { 
    orderStatus: newStatus,
    ...additionalData 
  };

  const now = Date.now(); // Use milliseconds since epoch for consistency with Realtime DB

  // Add appropriate timestamps based on status change
  if (newStatus === 'PAYMENT_PENDING') {
    firestoreUpdates.paymentPendingAt = now;
  } else if (newStatus === 'PAYMENT_SUCCESS') {
    firestoreUpdates.paymentSuccessAt = now;
  } else if (newStatus === 'PAYMENT_FAILED') {
    firestoreUpdates.paymentFailedAt = now;
  } else if (newStatus === 'PLACED') {
    firestoreUpdates.orderPlacedAt = now;
  } else if (newStatus === 'CONFIRMED') {
    firestoreUpdates.orderConfirmedAt = now;
  } else if (newStatus === 'OUT_FOR_DELIVERY') {
    firestoreUpdates.outForDeliveryAt = now;
  } else if (newStatus === 'DELIVERED') {
    firestoreUpdates.orderDeliveredAt = now;
  } else if (newStatus === 'CANCELLED') {
    firestoreUpdates.orderCancelledAt = now;
  } else if (newStatus === 'RETURN_REQUESTED') {
    firestoreUpdates.returnRequestedAt = now;
  } else if (newStatus === 'RETURN_INITIATED') {
    firestoreUpdates.returnInitiatedAt = now;
  } else if (newStatus === 'RETURN_REJECTED') {
    firestoreUpdates.returnRejectedAt = now;
  } else if (newStatus === 'OUT_FOR_PICKUP') {
    firestoreUpdates.outForPickupAt = now;
  } else if (newStatus === 'RETURN_PICKED') {
    firestoreUpdates.returnPickedAt = now;
  } else if (newStatus === 'REFUND_INITIATED') {
    firestoreUpdates.refundInitiatedAt = now;
  } else if (newStatus === 'REFUND_COMPLETED') {
    firestoreUpdates.refundCompletedAt = now;
  } else if (newStatus === 'DISPUTE_RAISED') {
    firestoreUpdates.disputeRaisedAt = now;
  } else if (newStatus === 'DISPUTE_RESOLVED') {
    firestoreUpdates.disputeResolvedAt = now;
  }

  // Always update Firestore first
  try {
    await updateOrderAPI(orderId, firestoreUpdates);
  } catch (error) {
    console.error('Failed to update order status in Firestore:', error);
    throw error;
  }

  try {
    await addOrderStatusUpdateToRealtimeDB(orderId, newStatus, number);
  } catch (error) {
    console.error('Order status updated in Firestore, but failed in Realtime DB:', error);
    return { success: true, data: firestoreUpdates, warning: 'Realtime DB update failed' };
  }

  return { success: true, data: firestoreUpdates };
};
