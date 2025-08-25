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
        const storageRef = ref(storage, `product-images/${Date.now()}-${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);        
        return getDownloadURL(snapshot.ref);
      }
      if (typeof image === 'string') {
        return image;
      }
      return null;
    })
  );
  return imageUrls.filter(url => url);
}

export async function addProduct(product) {
  const imageUrls = await uploadProductImages(product.images);

  const {
    images,
    image,
    sku,
    regularPrice,
    salePrice,
    stockQuantity,
    unit,
    weight,
    volume,
    status,
    variants,
    ...cleanProductData
  } = product;

  const productData = {
    ...cleanProductData,
    category: product.category || 'Feed',
    animal: product.animal || 'Cow',
    gallery: imageUrls,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Only add mainVariant for Feed products
  if ((product.category || 'Feed') === 'Feed') {
    const mainVariant = {
      sku: product.sku || '',
      regularPrice: Number(product.regularPrice) || 0,
      salePrice: Number(product.salePrice) || 0,
      stockQuantity: Number(product.stockQuantity) || 0,
      unit: product.unit || '',
      volume: Number(product.weight || product.volume) || 0,
      status: product.status || 'in_stock'
    };
    productData.variants = [mainVariant];
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      productData.variants = [mainVariant, ...product.variants];
    }
  } else if ((product.category || 'Feed') === 'Supplement') {
    // For Supplement, only use the variants array (no mainVariant), but ensure status is set
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      productData.variants = product.variants.map(v => ({
        ...v,
        regularPrice: Number(v.regularPrice) || 0,
        salePrice: Number(v.salePrice) || 0,
        stockQuantity: Number(v.stockQuantity) || 0,
        volume: Number(v.volume) || 0,
        status: v.status || 'in_stock',
      }));
    } else {
      productData.variants = [];
    }
  }

  console.log('Adding product to Firestore:', productData);

  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, productData);
  
  console.log('Product added successfully with ID:', docRef.id);
  
  return { id: docRef.id, ...productData };
}

export async function updateProduct(id, updates) {
  const {
    images,
    image,
    sku,
    regularPrice,
    salePrice,
    stockQuantity,
    unit,
    weight,
    volume,
    status,
    variants,
    nameTamil,
    descriptionTamil,
    ...cleanProductData
  } = updates;

  const productData = {
    ...cleanProductData,
    category: updates.category || 'Feed',
    animal: updates.animal || 'Cow',
    gallery: updates.gallery || [],
    createdAt: updates.createdAt || Date.now(),
    updatedAt: Date.now(),
    nameTamil: nameTamil || '',
    descriptionTamil: descriptionTamil || ''
  };

  if ((updates.category || 'Feed') === 'Feed') {
    const mainVariant = {
      sku: updates.sku || '',
      regularPrice: Number(updates.regularPrice) || 0,
      salePrice: Number(updates.salePrice) || 0,
      stockQuantity: Number(updates.stockQuantity) || 0,
      unit: updates.unit || '',
      volume: Number(updates.weight || updates.volume) || 0,
      status: updates.status || 'in_stock'
    };
    let otherVariants = [];
    if (updates.variants && Array.isArray(updates.variants) && updates.variants.length > 0) {
      otherVariants = updates.variants.filter(v => v.sku !== mainVariant.sku);
      otherVariants = otherVariants.map(v => ({
        ...v,
        regularPrice: Number(v.regularPrice) || 0,
        salePrice: Number(v.salePrice) || 0,
        stockQuantity: Number(v.stockQuantity) || 0,
        volume: Number(v.volume) || 0,
        status: v.status || 'in_stock',
      }));
    }
    productData.variants = [mainVariant, ...otherVariants];
  } else if ((updates.category || 'Feed') === 'Supplement') {
    if (updates.variants && Array.isArray(updates.variants) && updates.variants.length > 0) {
      productData.variants = updates.variants.map(v => ({
        ...v,
        regularPrice: Number(v.regularPrice) || 0,
        salePrice: Number(v.salePrice) || 0,
        stockQuantity: Number(v.stockQuantity) || 0,
        volume: Number(v.volume) || 0,
        status: v.status || 'in_stock',
      }));
    } else {
      productData.variants = [];
    }
  }

  const productRef = doc(db, 'products', id);
  await updateDoc(productRef, productData);
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