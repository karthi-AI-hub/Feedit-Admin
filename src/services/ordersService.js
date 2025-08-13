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
      // previousStatus: previousStatus,
      status: finalStatus,
      number: number,
      // updatedAt: currentTime,
      confirmedAt: finalStatus === 'CONFIRMED' ? currentTime : null,
      deliveredAt: finalStatus === 'DELIVERED' ? currentTime : null,
      cancelledAt: finalStatus === 'CANCELLED' ? currentTime : null
    });
    
    // console.log('Order status update added to realtime database successfully');
    return true;
  } catch (error) {
    console.error('Failed to add order status to realtime database:', error);
    throw error;
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
  try {
    // Prepare Firestore updates
    let firestoreUpdates = { 
      orderStatus: newStatus,
      ...additionalData 
    };
    
    const now = Date.now(); // Use milliseconds since epoch for consistency with Realtime DB
    
    // Add appropriate timestamps based on status change
    if (newStatus === 'CONFIRMED') {
      firestoreUpdates.orderConfirmed = now;
    } else if (newStatus === 'DELIVERED') {
      firestoreUpdates.orderDelivered = now;
    } else if (newStatus === 'CANCELLED') {
      firestoreUpdates.orderCancelled = now;
    }
    
    // Update Firestore
    await updateOrderAPI(orderId, firestoreUpdates);
    
    // Update Realtime Database
    await addOrderStatusUpdateToRealtimeDB(orderId, newStatus, number);
    
    return { success: true, data: firestoreUpdates };
  } catch (error) {
    console.error('Failed to update order status in both databases:', error);
    throw error;
  }
};
