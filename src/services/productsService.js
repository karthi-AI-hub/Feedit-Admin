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

  // Store main product data in variants array for both Feed and Supplement products
  const mainVariant = {
    regularPrice: product.regularPrice || 0,
    salePrice: product.salePrice || 0,
    stockQuantity: product.stockQuantity || 0,
    unit: product.unit || '',
    volume: product.weight || product.volume || '', // Use weight as volume for main variant
    status: product.status || 'in_stock' // Add status to each variant
  };

  // Build productData object excluding variant-related fields
  const { 
    images, // Exclude images array (input from form)
    image, // Exclude individual image field
    regularPrice, 
    salePrice, 
    stockQuantity, 
    unit, 
    weight, 
    volume, 
    status, // Exclude status from main product since it's now in variants
    variants,
    ...cleanProductData 
  } = product;

  const productData = {
    ...cleanProductData,
    category: product.category || 'Feed', // Default category
    animal: product.animal || 'Cow', // Default animal
    gallery: imageUrls, // The full gallery
    createdAt: Date.now(), // Use timestamp as long number
    updatedAt: Date.now() // Use timestamp as long number
  };

  productData.variants = [mainVariant];

  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    productData.variants = [mainVariant, ...product.variants];
  }

  console.log('Adding product to Firestore:', productData);

  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, productData);
  
  console.log('Product added successfully with ID:', docRef.id);
  
  return { id: docRef.id, ...productData };
}

export async function updateProduct(id, updates) {
  let mainVariant = null;
  let cleanUpdates = { ...updates };

  if (updates.regularPrice !== undefined || updates.salePrice !== undefined || 
      updates.stockQuantity !== undefined || updates.unit !== undefined || 
      updates.volume !== undefined || updates.weight !== undefined || 
      updates.status !== undefined) {
    
    mainVariant = {
      regularPrice: updates.regularPrice || 0,
      salePrice: updates.salePrice || 0,
      stockQuantity: updates.stockQuantity || 0,
      unit: updates.unit || '',
      volume: updates.weight || updates.volume || '',
      status: updates.status || 'in_stock'
    };

    // Build cleanUpdates object excluding variant-related fields
    const { 
      images, 
      image,
      regularPrice, 
      salePrice, 
      stockQuantity, 
      unit, 
      weight, 
      volume, 
      status,
      variants,
      ...otherUpdates 
    } = updates;

    cleanUpdates = otherUpdates;
  }

  const productData = { 
    ...cleanUpdates,
    updatedAt: Date.now() // Use timestamp as long number
  };

  // Only process and update image fields if new images are actually passed in.
  if (updates.images && Array.isArray(updates.images)) {
    const imageUrls = await uploadProductImages(updates.images);
    productData.gallery = imageUrls; // The full gallery
  }

  // Add variants to productData if mainVariant was created
  if (mainVariant) {
    // Initialize variants array with main product data as first variant
    productData.variants = [mainVariant];

    // If there are additional variants in the updates, add them to the array
    if (updates.variants && Array.isArray(updates.variants) && updates.variants.length > 0) {
      // Add any additional variants (excluding the first one which is the main product data)
      productData.variants = [mainVariant, ...updates.variants];
    }
  }

  // console.log('Updating product in Firestore:', { id, productData });

  const productRef = doc(db, 'products', id);
  await updateDoc(productRef, productData);
  
  // console.log('Product updated successfully');
  
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