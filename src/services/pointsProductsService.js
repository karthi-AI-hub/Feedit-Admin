import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  orderBy,
  query 
} from 'firebase/firestore';

const COLLECTION_NAME = 'rewards';
export const checkDuplicates = async (coins, productId, variantSku = null, excludeId = null) => {
  try {
    const coinsValue = parseInt(coins);
    if (isNaN(coinsValue) || coinsValue <= 0) {
      return { success: false, error: 'Invalid coins value' };
    }

    if (!productId || typeof productId !== 'string') {
      return { success: false, error: 'Invalid product ID' };
    }

    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const existingEntries = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Exclude the current item when updating
      if (excludeId && doc.id === excludeId) return;
      
      existingEntries.push({
        id: doc.id,
        coins: data.coins,
        productId: data.productId,
        productName: data.productName,
        variant: data.variant
      });
    });

    const coinsExists = existingEntries.find(entry => {
      const entryCoins = typeof entry.coins === 'number' ? entry.coins : parseInt(entry.coins);
      return entryCoins === coinsValue;
    });
    
    // Check for product + variant combination duplicates
    const productVariantExists = existingEntries.find(entry => {
      const sameProduct = entry.productId && entry.productId.toString() === productId.toString();
      
      if (!sameProduct) return false;
      
      // If both have variants, check if they're the same
      if (variantSku && entry.variant && entry.variant.sku) {
        return entry.variant.sku === variantSku;
      }
      
      // If one has variant and other doesn't, they're different
      if ((variantSku && !entry.variant) || (!variantSku && entry.variant)) {
        return false;
      }
      
      // If neither has variants, they're the same
      return !variantSku && !entry.variant;
    });

    return {
      success: true,
      coinsExists,
      productVariantExists,
      duplicates: { coinsExists: !!coinsExists, productVariantExists: !!productVariantExists }
    };
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return { success: false, error: error.message };
  }
};

export const addPointsProduct = async (pointsProductData) => {
  try {
    const variantSku = pointsProductData.variant ? pointsProductData.variant.sku : null;
    const duplicateCheck = await checkDuplicates(pointsProductData.coins, pointsProductData.productId, variantSku);
    
    if (!duplicateCheck.success) {
      return { success: false, error: 'Failed to check duplicates' };
    }

    if (duplicateCheck.coinsExists) {
      return { 
        success: false, 
        error: `${pointsProductData.coins} coins are already assigned to "${duplicateCheck.coinsExists.productName}"` 
      };
    }

    if (duplicateCheck.productVariantExists) {
      const variantText = variantSku ? ` (variant: ${variantSku})` : '';
      return { 
        success: false, 
        error: `Product "${pointsProductData.productName}"${variantText} already has a Milky Drops redemption value set` 
      };
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...pointsProductData,
      coins: parseInt(pointsProductData.coins),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding points-product:', error);
    return { success: false, error: error.message };
  }
};

export const getPointsProducts = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const pointsProducts = [];
    querySnapshot.forEach((doc) => {
      pointsProducts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return { success: true, data: pointsProducts };
  } catch (error) {
    console.error('Error getting points-products:', error);
    return { success: false, error: error.message };
  }
};

export const updatePointsProduct = async (id, updateData) => {
  try {
    const variantSku = updateData.variant ? updateData.variant.sku : null;
    const duplicateCheck = await checkDuplicates(updateData.coins, updateData.productId, variantSku, id);
    
    if (!duplicateCheck.success) {
      return { success: false, error: 'Failed to check duplicates' };
    }

    if (duplicateCheck.coinsExists) {
      return { 
        success: false, 
        error: `${updateData.coins} coins are already assigned to "${duplicateCheck.coinsExists.productName}"` 
      };
    }

    if (duplicateCheck.productVariantExists) {
      const variantText = variantSku ? ` (variant: ${variantSku})` : '';
      return { 
        success: false, 
        error: `Product "${updateData.productName}"${variantText} already has a Milky Drops redemption value set` 
      };
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updateData,
      coins: parseInt(updateData.coins),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating points-product:', error);
    return { success: false, error: error.message };
  }
};

export const deletePointsProduct = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting points-product:', error);
    return { success: false, error: error.message };
  }
};