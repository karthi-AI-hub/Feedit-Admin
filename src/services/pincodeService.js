import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';

export const fetchPincodesAPI = async () => {
  const pincodesCollection = collection(db, 'pincodes');
  const snapshot = await getDocs(pincodesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addPincodeAPI = async (pincode) => {
  const docRef = await addDoc(collection(db, 'pincodes'), {
    pincode,
    active: true,
  });
  return { id: docRef.id, pincode, active: true };
};

export const updatePincodeStatusAPI = async (id, active) => {
  const pincodeRef = doc(db, 'pincodes', id);
  await updateDoc(pincodeRef, { active });
};

export const deletePincodeAPI = async (id) => {
  const pincodeRef = doc(db, 'pincodes', id);
  await deleteDoc(pincodeRef);
  return true;
};
