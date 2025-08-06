import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadProductImages(images) {
  if (!images || images.length === 0) {
    return [];
  }

  const imageUrls = await Promise.all(
    images.map(async (image) => {
      if (image instanceof File) {
        // Creates a reference to the file location
        const storageRef = ref(storage, `product-images/${Date.now()}-${image.name}`);
        
        // Uploads the file
        const snapshot = await uploadBytes(storageRef, image); 
        
        // Gets the public URL
        return getDownloadURL(snapshot.ref);
      }
      if (typeof image === 'string') {
        return image;
      }
      return null;
    })
  );
  return imageUrls.filter(url => url); // Filter out nulls
}

export async function addProduct(product) {
  const imageUrls = await uploadProductImages(product.images);

  const productData = { ...product };
  delete productData.images; // Not a Firestore-compatible field
  productData.image = imageUrls[0] || ''; // The main image
  productData.gallery = imageUrls; // The full gallery

  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, productData);
  return { id: docRef.id, ...productData };
}

export async function updateProduct(id, updates) {
  const productData = { ...updates };

  // Only process and update image fields if new images are actually passed in.
  if (updates.images && Array.isArray(updates.images)) {
    const imageUrls = await uploadProductImages(updates.images);
    delete productData.images; // Not a Firestore-compatible field
    productData.image = imageUrls[0] || ''; // The main image
    productData.gallery = imageUrls; // The full gallery
  }

  const productRef = doc(db, 'products', id);
  await updateDoc(productRef, productData);
  return { id, ...productData };
}

export async function getProducts() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getProductById(id) {
  const productRef = doc(db, 'products', id);
  const docSnap = await getDoc(productRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("No such product!");
  }
}
