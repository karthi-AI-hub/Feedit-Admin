import { db, storage } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const fetchBannersAPI = async () => {
  const bannersCollection = collection(db, 'banners');
  const bannerSnapshot = await getDocs(bannersCollection);
  return bannerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateBannerStatusAPI = async (id, active) => {
  const bannerRef = doc(db, 'banners', id);
  await updateDoc(bannerRef, { active });
};

export const uploadBannerAPI = async (image) => {
  const storageRef = ref(storage, `banners/${image.name}`);
  await uploadBytes(storageRef, image.file);
  const downloadURL = await getDownloadURL(storageRef);
  
  const docRef = await addDoc(collection(db, 'banners'), {
    name: image.name,
    url: downloadURL,
    active: image.active,
  });

  return { id: docRef.id, name: image.name, url: downloadURL, active: image.active };
};
