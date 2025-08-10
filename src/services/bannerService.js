import { db, storage } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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

export const deleteBannerAPI = async (id, imageName, imageUrl) => {
  try {
    // Delete from Firestore
    const bannerRef = doc(db, 'banners', id);
    await deleteDoc(bannerRef);

    // Delete from Storage
    if (imageName) {
      const storageRef = ref(storage, `banners/${imageName}`);
      try {
        await deleteObject(storageRef);
      } catch (storageError) {
        console.warn('Failed to delete image from storage:', storageError);
        // Continue even if storage deletion fails
      }
    }

    return { success: true, id };
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw new Error(`Failed to delete banner: ${error.message}`);
  }
};
