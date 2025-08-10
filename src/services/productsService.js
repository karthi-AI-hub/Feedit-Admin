import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
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

  const productData = { 
    ...product,
    status: product.status || 'in_stock', // Ensure status is always set
    category: product.category || 'Feed', // Default category
    animal: product.animal || 'Cow', // Default animal
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  delete productData.images; // Not a Firestore-compatible field
  productData.image = imageUrls[0] || ''; // The main image
  productData.gallery = imageUrls; // The full gallery

  console.log('Adding product to Firestore:', productData);

  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, productData);
  
  console.log('Product added successfully with ID:', docRef.id);
  
  return { id: docRef.id, ...productData };
}

export async function updateProduct(id, updates) {
  const productData = { 
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Only process and update image fields if new images are actually passed in.
  if (updates.images && Array.isArray(updates.images)) {
    const imageUrls = await uploadProductImages(updates.images);
    delete productData.images; // Not a Firestore-compatible field
    productData.image = imageUrls[0] || ''; // The main image
    productData.gallery = imageUrls; // The full gallery
  }

  console.log('Updating product in Firestore:', { id, productData });

  const productRef = doc(db, 'products', id);
  await updateDoc(productRef, productData);
  
  console.log('Product updated successfully');
  
  return { id, ...productData };
}

export async function getProducts() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  // console.log('Fetched products:', snapshot.docs.length);
  // console.log('Fetched products:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

export async function deleteProduct(id) {
  try {
    console.log('Deleting product with ID:', id);
    
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
    
    console.log('Product deleted successfully');
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}
