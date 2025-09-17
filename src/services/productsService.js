import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

async function uploadProductImages(images, onProgress = null) {
  if (!images || images.length === 0) {
    return [];
  }

  // Separate existing URLs from new files for efficient processing
  const existingUrls = images.filter(img => typeof img === 'string');
  const filesToUpload = images.filter(img => img instanceof File);
  
  if (filesToUpload.length === 0) {
    return existingUrls;
  }

  const uploadPromises = filesToUpload.map(async (image, index) => {
    try {
      // Use more efficient naming strategy
      const timestamp = Date.now() + index; // Avoid collisions
      const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
      const fileName = `${timestamp}-${sanitizedName}`;
      
      const storageRef = ref(storage, `product-images/${fileName}`);
      const snapshot = await uploadBytes(storageRef, image);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      // Report progress if callback provided
      if (onProgress) {
        onProgress({
          completed: index + 1,
          total: filesToUpload.length,
          currentFile: image.name
        });
      }
      
      return downloadUrl;
    } catch (error) {
      console.error(`Failed to upload image ${image.name}:`, error);
      throw error; // Re-throw to handle in calling function
    }
  });

  const uploadedUrls = await Promise.all(uploadPromises);
  return [...existingUrls, ...uploadedUrls];
}

export async function uploadProductBrochure(brochureFile) {
  if (!brochureFile || !(brochureFile instanceof File)) {
    throw new Error('Invalid file provided for brochure upload');
  }

  try {
    // Generate unique filename with better performance
    const timestamp = Date.now();
    const sanitizedName = brochureFile.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100); // Limit filename length
    const fileName = `${timestamp}-${sanitizedName}`;
    
    const storageRef = ref(storage, `product-brochures/${fileName}`);
    const snapshot = await uploadBytes(storageRef, brochureFile);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error uploading brochure:', error);
    }
    
    // Provide user-friendly error messages based on error code
    switch (error.code) {
      case 'storage/unauthorized':
        throw new Error('You do not have permission to upload files. Please contact support.');
      case 'storage/canceled':
        throw new Error('Upload was canceled. Please try again.');
      case 'storage/quota-exceeded':
        throw new Error('Storage quota exceeded. Please contact support.');
      case 'storage/invalid-checksum':
        throw new Error('File appears to be corrupted. Please try again.');
      case 'storage/retry-limit-exceeded':
        throw new Error('Network error. Please check your connection and try again.');
      default:
        throw new Error('Failed to upload brochure. Please check your connection and try again.');
    }
  }
}

export async function deleteProductBrochure(brochureUrl) {
  if (!brochureUrl || typeof brochureUrl !== 'string') {
    return { success: false, error: 'Invalid brochure URL provided' };
  }

  try {
    // Validate URL format efficiently
    const url = new URL(brochureUrl);
    if (!url.hostname.includes('firebasestorage.googleapis.com')) {
      return { success: false, error: 'Invalid Firebase Storage URL' };
    }

    const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
    if (!pathMatch) {
      return { success: false, error: 'Could not extract file path from URL' };
    }
    
    const filePath = decodeURIComponent(pathMatch[1]);
    const fileRef = ref(storage, filePath);
    
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting brochure from storage:', error);
    }
    
    // File not found is considered success (already deleted)
    if (error.code === 'storage/object-not-found') {
      return { success: true };
    }
    
    // Handle specific Firebase Storage errors with better messages
    switch (error.code) {
      case 'storage/unauthorized':
        return { success: false, error: 'Unauthorized to delete file' };
      case 'storage/retry-limit-exceeded':
        return { success: false, error: 'Network error, please try again' };
      case 'storage/invalid-argument':
        return { success: false, error: 'Invalid file reference' };
      default:
        return { success: false, error: 'Failed to delete brochure file' };
    }
  }
}

export async function addProduct(product, onProgress = null) {
  try {
    // Parallel upload of images and brochure for better performance
    const uploadPromises = [];
    
    // Add image upload promise
    if (product.images && product.images.length > 0) {
      uploadPromises.push(
        uploadProductImages(product.images, (progress) => {
          if (onProgress) {
            onProgress({
              stage: 'images',
              ...progress
            });
          }
        })
      );
    } else {
      uploadPromises.push(Promise.resolve([]));
    }
    
    // Add brochure upload promise
    if (product.brochure instanceof File) {
      uploadPromises.push(uploadProductBrochure(product.brochure));
    } else {
      uploadPromises.push(Promise.resolve(null));
    }
    
    // Report upload start
    if (onProgress) {
      onProgress({ stage: 'uploading', message: 'Uploading files...' });
    }
    
    // Wait for all uploads to complete
    const [imageUrls, brochureUrl] = await Promise.all(uploadPromises);

    // Report data processing
    if (onProgress) {
      onProgress({ stage: 'processing', message: 'Processing product data...' });
    }

    // Efficiently build product data
    const productData = {
      name: product.name || '',
      nameTamil: product.nameTamil || '',
      description: product.description || '',
      descriptionTamil: product.descriptionTamil || '',
      brand: product.brand || '',
      category: product.category || 'Feed',
      animal: product.animal || 'Cow',
      tags: product.tags || [],
      gallery: imageUrls,
      brochureUrl: brochureUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      active: typeof product.active === 'boolean' ? product.active : true
    };

    // Build variants data efficiently
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

    // Report saving to database
    if (onProgress) {
      onProgress({ stage: 'saving', message: 'Saving to database...' });
    }

    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, productData);
    
    if (onProgress) {
      onProgress({ stage: 'complete', message: 'Product added successfully!' });
    }
    
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error('Error adding product:', error);
    
    // Provide user-friendly error message
    if (error.message.includes('permission-denied')) {
      throw new Error('You do not have permission to add products.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('Failed to add product. Please try again.');
    }
  }
}

export async function updateProduct(id, updates, onProgress = null) {
  try {
    if (onProgress) {
      onProgress({ stage: 'fetching', message: 'Loading product data...' });
    }

    // Fetch existing product data
    const productRef = doc(db, 'products', id);
    const docSnap = await getDoc(productRef);
    if (!docSnap.exists()) {
      throw new Error('Product not found');
    }
    const existing = docSnap.data();

    // Prepare parallel operations for better performance
    const operations = [];
    
    // Handle image updates
    let newGallery = existing.gallery || [];
    if (updates.images && Array.isArray(updates.images)) {
      if (onProgress) {
        onProgress({ stage: 'images', message: 'Processing images...' });
      }
      
      operations.push(
        uploadProductImages(updates.images, (progress) => {
          if (onProgress) {
            onProgress({
              stage: 'images',
              ...progress
            });
          }
        }).then(urls => {
          newGallery = urls;
        })
      );
    } else if (typeof updates.gallery !== 'undefined') {
      newGallery = updates.gallery;
    }

    // Handle brochure updates
    let newBrochureUrl = existing.brochureUrl || null;
    
    if (updates.brochure instanceof File) {
      if (onProgress) {
        onProgress({ stage: 'brochure', message: 'Processing brochure...' });
      }
      
      // Run brochure operations in parallel
      const brochureOps = [];
      
      // Delete old brochure if exists (don't wait for this)
      if (existing.brochureUrl) {
        brochureOps.push(
          deleteProductBrochure(existing.brochureUrl).catch(error => {
            console.warn('Failed to delete old brochure:', error);
            // Don't fail the entire operation for this
          })
        );
      }
      
      // Upload new brochure
      brochureOps.push(
        uploadProductBrochure(updates.brochure).then(url => {
          newBrochureUrl = url;
        })
      );
      
      operations.push(Promise.all(brochureOps));
    } else if (updates.brochure === null || updates.brochure === undefined) {
      // Delete old brochure if we're removing it (don't block on this)
      if (existing.brochureUrl) {
        deleteProductBrochure(existing.brochureUrl).catch(error => {
          console.warn('Failed to delete brochure:', error);
        });
      }
      newBrochureUrl = null;
    } else if (typeof updates.brochure === 'string') {
      newBrochureUrl = updates.brochure;
    }

    // Wait for all upload operations to complete
    if (operations.length > 0) {
      await Promise.all(operations);
    }

    // Build updated product data efficiently
    const productData = {
      ...existing,
      name: updates.name || existing.name || '',
      nameTamil: updates.nameTamil || existing.nameTamil || '',
      description: updates.description || existing.description || '',
      descriptionTamil: updates.descriptionTamil || existing.descriptionTamil || '',
      brand: updates.brand || existing.brand || '',
      category: updates.category || existing.category || 'Feed',
      animal: updates.animal || existing.animal || 'Cow',
      tags: updates.tags || existing.tags || [],
      gallery: newGallery,
      brochureUrl: newBrochureUrl,
      createdAt: existing.createdAt || Date.now(),
      updatedAt: Date.now(),
      active: typeof updates.active === 'boolean' ? updates.active : (typeof existing.active === 'boolean' ? existing.active : true)
    };

    // Handle variants efficiently
    if ((productData.category || 'Feed') === 'Feed') {
      const mainVariant = {
        sku: updates.sku || existing.sku || '',
        regularPrice: Number(updates.regularPrice ?? existing.regularPrice) || 0,
        salePrice: Number(updates.salePrice ?? existing.salePrice) || 0,
        stockQuantity: Number(updates.stockQuantity ?? existing.stockQuantity) || 0,
        unit: updates.unit || existing.unit || '',
        volume: Number(updates.weight ?? updates.volume ?? existing.weight ?? existing.volume) || 0,
        status: updates.status || existing.status || 'in_stock'
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
      } else if (existing.variants && Array.isArray(existing.variants) && existing.variants.length > 1) {
        otherVariants = existing.variants.slice(1);
      }
      productData.variants = [mainVariant, ...otherVariants];
    } else if ((productData.category || 'Feed') === 'Supplement') {
      if (updates.variants && Array.isArray(updates.variants) && updates.variants.length > 0) {
        productData.variants = updates.variants.map(v => ({
          ...v,
          regularPrice: Number(v.regularPrice) || 0,
          salePrice: Number(v.salePrice) || 0,
          stockQuantity: Number(v.stockQuantity) || 0,
          volume: Number(v.volume) || 0,
          status: v.status || 'in_stock',
        }));
      } else if (existing.variants && Array.isArray(existing.variants)) {
        productData.variants = existing.variants;
      } else {
        productData.variants = [];
      }
    }

    if (onProgress) {
      onProgress({ stage: 'saving', message: 'Saving to database...' });
    }

    await updateDoc(productRef, productData);
    
    if (onProgress) {
      onProgress({ stage: 'complete', message: 'Product updated successfully!' });
    }
    
    return { id, ...productData };
  } catch (error) {
    console.error('Error updating product:', error);
    
    // Provide user-friendly error message
    if (error.message.includes('permission-denied')) {
      throw new Error('You do not have permission to update products.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.message === 'Product not found') {
      throw error; // Re-throw as is
    } else {
      throw new Error('Failed to update product. Please try again.');
    }
  }
}

export async function getProducts() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: products };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: error.message };
  }
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

// export async function deleteProduct(id) {
//   try {
//     console.log('Deleting product with ID:', id);
    
//     const productRef = doc(db, 'products', id);
//     await deleteDoc(productRef);
    
//     console.log('Product deleted successfully');
//     return { success: true, id };
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     throw new Error(`Failed to delete product: ${error.message}`);
//   }
// }

export async function updateProductActiveStatus(id, active) {
  const productRef = doc(db, 'products', id);
  await updateDoc(productRef, { active });
  return true;
}

export async function updateProductStatus(id, newStatus) {
  const productRef = doc(db, 'products', id);
  const docSnap = await getDoc(productRef);
  if (!docSnap.exists()) {
    throw new Error('Product not found');
  }
  const product = docSnap.data();
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    throw new Error('No variants found for this product');
  }
  // Update the status of all variants
  const updatedVariants = product.variants.map(variant => ({ ...variant, status: newStatus }));
  await updateDoc(productRef, { variants: updatedVariants, updatedAt: Date.now() });
  return true;
}