import { db } from '../lib/firebase';
import { collection, getDoc, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

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
