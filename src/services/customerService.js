import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const fetchCustomersAPI = async () => {
  const customersCollection = collection(db, 'USER');
  const customerSnapshot = await getDocs(customersCollection);
  const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return customerList;
};
